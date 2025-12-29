import { useState, useCallback } from 'react';
import { MetricsHeader } from '@/components/pipeline-editor/MetricsHeader';
import { PipelineCanvas } from '@/components/pipeline-editor/PipelineCanvas';
import { DataPreviewPanel } from '@/components/pipeline-editor/DataPreviewPanel';
import { CopilotDrawer } from '@/components/pipeline-editor/CopilotDrawer';
import type {
  PipelineNodeData,
  NodeConnection,
  MetricData,
  DataPreviewConfig,
  CopilotMessage,
  EncoderOption,
} from '@/types/pipeline-editor';

// Mock data for the pipeline
const INITIAL_NODES: PipelineNodeData[] = [
  {
    id: 'node-1',
    type: 'data-input',
    title: 'Data Input',
    icon: 'dataset',
    iconColor: '#22c55e',
    status: 'success',
    position: { x: 80, y: 160 },
    config: { Source: 'customer_churn.csv' },
    metadata: { rows: '4,521 Rows', cols: '18 Cols' },
  },
  {
    id: 'node-2',
    type: 'transformer',
    title: 'Standard Scaler',
    icon: 'transform',
    iconColor: '#60a5fa',
    status: 'success',
    position: { x: 420, y: 160 },
    config: { Mean: 'True', 'Std Dev': 'True' },
  },
  {
    id: 'node-3',
    type: 'encoder',
    title: 'One-Hot Encoder',
    icon: 'category',
    iconColor: '#facc15',
    status: 'warning',
    position: { x: 760, y: 260 },
    isActive: true,
    config: {},
  },
  {
    id: 'node-4',
    type: 'model',
    title: 'XGBoost',
    icon: 'psychology',
    iconColor: '#a78bfa',
    status: 'pending',
    position: { x: 1100, y: 260 },
    config: { Estimators: '100', 'Max Depth': '6' },
  },
];

const INITIAL_CONNECTIONS: NodeConnection[] = [
  { id: 'conn-1', sourceNodeId: 'node-1', targetNodeId: 'node-2', isActive: true },
  { id: 'conn-2', sourceNodeId: 'node-2', targetNodeId: 'node-3', isActive: true },
  { id: 'conn-3', sourceNodeId: 'node-3', targetNodeId: 'node-4', isActive: false },
];

const METRICS: MetricData[] = [
  { label: 'F1-Score', value: '0.87', delta: '\u25B2 2.4%', deltaType: 'positive' },
  { label: 'RMSE', value: '0.12', delta: '\u25BC 1.1%', deltaType: 'negative' },
  { label: 'Cost', value: '$0.04/hr' },
];

const DATA_PREVIEW: DataPreviewConfig = {
  fileName: 'Customer_Churn.csv',
  rowCount: 4521,
  columns: [
    'User_ID',
    'Gender',
    'Tenure',
    'Contract_Type',
    'Payment_Method',
    'Monthly_Charges',
    'Total_Charges',
    'Churn',
  ],
  data: [
    {
      User_ID: '7590-VHVEG',
      Gender: 'Female',
      Tenure: 1,
      Contract_Type: 'Month-to-month',
      Payment_Method: 'Electronic check',
      Monthly_Charges: '$29.85',
      Total_Charges: '$29.85',
      Churn: 'No',
    },
    {
      User_ID: '5575-GNVDE',
      Gender: 'Male',
      Tenure: 34,
      Contract_Type: 'One year',
      Payment_Method: 'Mailed check',
      Monthly_Charges: '$56.95',
      Total_Charges: '$1889.50',
      Churn: 'No',
    },
    {
      User_ID: '3668-QPYBK',
      Gender: 'Male',
      Tenure: 2,
      Contract_Type: 'Month-to-month',
      Payment_Method: 'Mailed check',
      Monthly_Charges: '$53.85',
      Total_Charges: '$108.15',
      Churn: 'Yes',
    },
    {
      User_ID: '7795-CFOCW',
      Gender: 'Male',
      Tenure: 45,
      Contract_Type: 'One year',
      Payment_Method: 'Bank transfer',
      Monthly_Charges: '$42.30',
      Total_Charges: '$1840.75',
      Churn: 'No',
    },
  ],
};

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-1',
    type: 'analysis',
    content: `Analyzing pipeline topology... <br/><br/>
      I noticed you're using <span class="text-white font-mono bg-white/5 px-1 rounded">One-Hot Encoder</span> on the dataset. The column <span class="text-white font-mono bg-white/5 px-1 rounded">Payment_Method</span> has moderate cardinality, but if you plan to include 'City' or 'Zip Code', the feature space will explode.`,
    timestamp: '2 min ago',
  },
  {
    id: 'msg-2',
    type: 'recommendation',
    content: `<p class="text-white font-medium mb-2">Recommendation:</p>
      <p>Consider switching to <span class="text-white font-bold">Target Encoder</span>. It typically performs better with XGBoost for categorical variables and reduces dimensionality.</p>`,
    timestamp: 'Just now',
    action: {
      label: 'Auto-Swap to Target Encoder',
      onClick: () => console.log('Auto-swap triggered'),
    },
  },
];

const SYSTEM_LOGS = [
  '> checking_compatibility(node=3)',
  '> validation_passed: True',
  '> calculating_feature_importance...',
];

export function PipelineEditorPage() {
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [systemLogs, setSystemLogs] = useState(SYSTEM_LOGS);

  const handleSave = useCallback(() => {
    console.log('Pipeline saved');
  }, []);

  const handleRun = useCallback(() => {
    console.log('Pipeline run started');
  }, []);

  const handleSwapEncoder = useCallback((nodeId: string, option: EncoderOption) => {
    console.log(`Swapping node ${nodeId} to ${option.name}`);
    // Add system log
    setSystemLogs((prev) => [...prev, `> encoder_swapped: ${option.name}`]);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    const newMessage: CopilotMessage = {
      id: `msg-${Date.now()}`,
      type: 'analysis',
      content: `Processing your request: "${message}"...`,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, newMessage]);
    setSystemLogs((prev) => [...prev, `> user_query: "${message}"`]);
  }, []);

  return (
    <div className="pe-page h-full flex overflow-hidden bg-[#0a0a0f] text-white font-display">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Metrics Header */}
        <MetricsHeader
          pipelineName="Customer Churn Prediction"
          version="V1.4"
          metrics={METRICS}
          onSave={handleSave}
          onRun={handleRun}
        />

        {/* Canvas Workspace */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Canvas */}
          <PipelineCanvas
            initialNodes={INITIAL_NODES}
            initialConnections={INITIAL_CONNECTIONS}
            onSwapEncoder={handleSwapEncoder}
          />

          {/* Data Preview Panel */}
          <DataPreviewPanel
            config={DATA_PREVIEW}
            isExpanded={isPreviewExpanded}
            onToggle={() => setIsPreviewExpanded(!isPreviewExpanded)}
          />

          {/* Copilot Drawer */}
          <CopilotDrawer
            messages={messages}
            systemLogs={systemLogs}
            isOpen={isCopilotOpen}
            onClose={() => setIsCopilotOpen(false)}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default PipelineEditorPage;
