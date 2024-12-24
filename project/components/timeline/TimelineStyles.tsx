export const TimelineStyles = () => (
  <style jsx global>{`
    /* Hide scrollbar for all elements */
    * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }

    *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }

    /* Main container styles */
    #__next {
      overflow: hidden !important;
    }

    body {
      overflow-y: scroll !important;
      overflow-x: hidden !important;
      position: relative !important;
    }

    .timeline-container {
      width: 100%;
      padding: 1rem;
      background: transparent;
      overflow: hidden !important;
    }
    .timeline-wrapper {
      width: 100%;
      background: transparent;
      overflow: hidden;
      position: relative;
      border-radius: 1rem;
    }
    .vis-timeline {
      border: none;
      font-family: inherit;
      background: transparent;
      max-width: 100vw;
    }
    .vis-panel {
      background: transparent;
    }
    .vis-panel.vis-center {
      border: none;
      position: relative;
    }
    .vis-panel.vis-center::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(to bottom,
        transparent,
        var(--border) 50%,
        transparent
      );
      transform: translateX(-50%);
      opacity: 1;
      box-shadow: 0 0 15px var(--border/30),
                 0 0 30px var(--border/20);
    }
    .vis-panel.vis-center::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 12px;
      background: linear-gradient(to bottom,
        transparent,
        var(--border/30) 50%,
        transparent
      );
      transform: translateX(-50%);
      filter: blur(8px);
      opacity: 0.75;
    }
    .vis-labelset .vis-label {
      color: var(--muted-foreground);
    }
    .timeline-item {
      padding: 1rem;
      border-radius: 0.5rem;
      background: var(--card);
      border: 1px solid var(--border);
      position: relative;
      transition: all 0.2s ease-in-out;
      width: 100%;
      max-width: 300px;
      word-wrap: break-word;
    }
    .timeline-item:hover {
      border-color: var(--primary);
      box-shadow: 0 0 0 1px var(--primary);
    }
    .timeline-title {
      font-weight: 600;
      color: var(--foreground);
      font-size: 0.925rem;
      line-height: 1.4;
      margin-bottom: 0.5rem;
    }
    .timeline-date {
      font-size: 0.875rem;
      color: var(--muted-foreground);
    }
    .vis-item {
      border: none;
      background: transparent;
      margin: 0.5rem 0;
    }
    .vis-item.timeline-item-left {
      margin-right: 2rem;
    }
    .vis-item.timeline-item-right {
      margin-left: 2rem;
    }
    .vis-item.vis-selected .timeline-item {
      border-color: var(--primary);
      background: var(--primary/10);
    }
    .vis-time-axis {
      font-size: 0.875rem;
      color: var(--muted-foreground);
    }
    .vis-time-axis .vis-text {
      padding: 0.5rem 0;
    }
    .vis-time-axis .vis-grid.vis-minor,
    .vis-time-axis .vis-grid.vis-major {
      border: none;
    }
    .vis-time-axis .vis-text.vis-major {
      font-weight: 600;
    }
    .timeline-item-wrapper {
      opacity: 0;
      animation: fadeIn 0.5s ease-out forwards;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @media (max-width: 768px) {
      .timeline-item {
        padding: 0.75rem;
        max-width: 250px;
      }
      .timeline-title {
        font-size: 0.875rem;
      }
      .timeline-date {
        font-size: 0.75rem;
      }
      .vis-time-axis {
        font-size: 0.75rem;
      }
      .vis-item.timeline-item-left {
        margin-right: 1rem;
      }
      .vis-item.timeline-item-right {
        margin-left: 1rem;
      }
    }
    .vis-panel.vis-bottom {
      border-top: 4px solid var(--border);
      position: relative;
    }
    .vis-panel.vis-bottom::after {
      content: '';
      position: absolute;
      top: -4px;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(to right,
        var(--border/5),
        var(--border),
        var(--border/5)
      );
      opacity: 1;
      box-shadow: 0 -2px 8px var(--border/20);
    }
  `}</style>
);