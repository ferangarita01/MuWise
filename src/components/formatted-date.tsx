
'use client';

import { useState, useEffect } from 'react';

interface FormattedDateProps {
  dateString: string;
  options?: Intl.DateTimeFormatOptions;
}

export function FormattedDate({ dateString, options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
} }: FormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    if (dateString) {
      try {
        const date = new Date(dateString);
        // Check if the date is valid before formatting
        if (!isNaN(date.getTime())) {
          setFormattedDate(date.toLocaleString(undefined, options));
        } else {
          setFormattedDate('Invalid Date');
        }
      } catch (e) {
        setFormattedDate('Invalid Date');
      }
    }
  }, [dateString, options]);

  return <>{formattedDate}</>;
}
