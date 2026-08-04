import { GitCommit, GitBranch, Clock, User, FileText, Tag, MoreHorizontal } from 'lucide-react';
import styles from './VariantTimeline.module.css';

export interface TimelineEvent {
  id: string;
  type: 'created' | 'modified' | 'version' | 'published' | 'merged';
  date: string;
  author: string;
  description: string;
  details?: string[];
  variantId?: string;
  version?: string;
}

interface VariantTimelineProps {
  events: TimelineEvent[];
  variantId?: string;
}

/**
 * VariantTimeline - Timeline estilo Git para historial de variantes
 */
export function VariantTimeline({ events, variantId }: VariantTimelineProps) {
  const filteredEvents = variantId 
    ? events.filter(e => e.variantId === variantId)
    : events;

  if (filteredEvents.length === 0) {
    return (
      <div className={styles.emptyTimeline}>
        <GitCommit className={styles.emptyIcon} />
        <span>No history yet</span>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineList}>
        {filteredEvents.map((event, idx) => (
          <TimelineItem key={event.id} event={event} isLast={idx === filteredEvents.length - 1} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  return (
    <div className={styles.timelineItem}>
      <div className={styles.timelineMarker}>
        <TimelineIcon type={event.type} />
      </div>
      <div className={styles.timelineContent}>
        <div className={styles.timelineHeader}>
          <span className={styles.timelineType}>{event.type}</span>
          <span className={styles.timelineDate}>{formatDate(event.date)}</span>
          {event.version && (
            <span className={styles.timelineVersion}>{event.version}</span>
          )}
        </div>
        <div className={styles.timelineBody}>
          <p className={styles.timelineDescription}>{event.description}</p>
          <div className={styles.timelineMeta}>
            <User className={styles.metaIcon} />
            <span className={styles.timelineAuthor}>{event.author}</span>
            <Clock className={styles.metaIcon} />
            <span className={styles.timelineTime}>{formatTime(event.date)}</span>
          </div>
          {event.details && event.details.length > 0 && (
            <div className={styles.timelineDetails}>
              {event.details.map((detail, idx) => (
                <div key={idx} className={styles.detailItem}>
                  <FileText className={styles.detailIcon} />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {!isLast && <div className={styles.timelineConnector} />}
    </div>
  );
}

function TimelineIcon({ type }: { type: TimelineEvent['type'] }) {
  switch (type) {
    case 'created':
      return <GitBranch className={styles.iconCreated} />;
    case 'modified':
      return <GitCommit className={styles.iconModified} />;
    case 'version':
      return <Tag className={styles.iconVersion} />;
    case 'published':
      return <GitCommit className={styles.iconPublished} />;
    case 'merged':
      return <GitBranch className={styles.iconMerged} />;
    default:
      return <GitCommit />;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
