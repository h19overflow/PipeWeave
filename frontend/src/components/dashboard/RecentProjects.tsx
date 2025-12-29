/**
 * Recent projects grid with empty state
 * Staggered animation on mount for visual interest
 */

import { motion } from 'framer-motion';
import { ArrowRight, Folder } from 'lucide-react';
import { ProjectCard, type ProjectCardProps } from './ProjectCard';

interface RecentProjectsProps {
  projects: ProjectCardProps[];
  onViewAll?: () => void;
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Icon with animated glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#3713ec] blur-3xl opacity-20 animate-pulse" />
        <div className="relative p-6 bg-[#131022] border-2 border-dashed border-[#1e1a36] rounded-2xl">
          <Folder size={48} className="text-[#9b92c9]" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
      <p className="text-[#9b92c9] max-w-md mb-6">
        Start your first ML project by uploading a dataset and letting PipeWeave guide you through the workflow.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-[#3713ec] hover:bg-[#4a2bef] text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
      >
        Start Your First Project
        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  );
}

export function RecentProjects({ projects, onViewAll }: RecentProjectsProps) {
  const hasProjects = projects.length > 0;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Recent Projects</h2>
          <p className="text-[#9b92c9]">Continue where you left off</p>
        </div>

        {hasProjects && (
          <motion.button
            onClick={onViewAll}
            whileHover={{ x: 4 }}
            className="flex items-center gap-2 text-[#3713ec] hover:text-[#4a2bef] font-medium transition-colors"
          >
            View All
            <ArrowRight size={18} />
          </motion.button>
        )}
      </div>

      {/* Projects grid or empty state */}
      {hasProjects ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <ProjectCard {...project} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
