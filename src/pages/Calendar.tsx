import { AppLayout } from '@/components/layout/AppLayout';
import { FinancialCalendar } from '@/components/calendar/FinancialCalendar';

const Calendar = () => {
  return (
    <AppLayout title="Calendrier" subtitle="Planifiez vos flux récurrents">
      <FinancialCalendar />
    </AppLayout>
  );
};

export default Calendar;
