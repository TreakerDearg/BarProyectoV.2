import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Table } from '../types/table';

interface MiniCalendarProps {
  tables: Table[];
  onDateSelect: (date: string) => void;
}

// Helper to extract dates with active discounts
const getDiscountDates = (tables: Table[]) => {
  const dates = new Set<string>();
  tables.forEach((t) => {
    if (t.discounts && t.discounts.some((d) => d.active)) {
      // Assuming reservationStart holds date string for the reservation
      if (t.currentReservation) {
        // Placeholder: In real case, fetch reservation date from API; here we use today for demo
        const today = new Date().toISOString().split('T')[0];
        dates.add(today);
      }
    }
  });
  return Array.from(dates);
};

const MiniCalendar: React.FC<MiniCalendarProps> = ({ tables, onDateSelect }) => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const discountDates = getDiscountDates(tables);
    const ev = discountDates.map((d) => ({
      title: 'Discount',
      start: d,
      display: 'background',
      backgroundColor: '#ffd700', // gold badge
    }));
    setEvents(ev);
  }, [tables]);

  const handleDateClick = (arg: any) => {
    onDateSelect(arg.dateStr);
  };

  return (
    <div className="mini-calendar-wrapper w-full max-w-xs mx-auto p-2 bg-white/5 rounded-lg shadow-lg">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        height="auto"
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        events={events}
        dateClick={handleDateClick}
      />
    </div>
  );
};

export default MiniCalendar;
