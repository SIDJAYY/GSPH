import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsCharts from './AnalyticsCharts';

describe('AnalyticsCharts', () => {
    test('renders empty state when no data is provided', () => {
        render(<AnalyticsCharts />);
        expect(screen.getByText('No Analytics Data Available')).toBeInTheDocument();
        expect(screen.getByText('Analytics charts will appear here once data is available.')).toBeInTheDocument();
    });

    test('renders charts when data is provided', () => {
        const mockData = {
            monthlyEnrollment: [{ month: 'Jan', students: 100 }],
            programDistribution: [{ name: 'Computer Science', value: 50 }],
            gpaDistribution: [{ name: '3.0-3.5', value: 30 }],
            yearLevelDistribution: [{ name: '1st Year', value: 25 }]
        };

        render(<AnalyticsCharts chartData={mockData} />);
        expect(screen.getByText('Enrollment Trends')).toBeInTheDocument();
        expect(screen.getByText('Program Distribution')).toBeInTheDocument();
        expect(screen.getByText('GPA Distribution')).toBeInTheDocument();
        expect(screen.getByText('Year Level Distribution')).toBeInTheDocument();
    });

    test('handles partial data gracefully', () => {
        const partialData = {
            monthlyEnrollment: [{ month: 'Jan', students: 100 }],
            programDistribution: [],
            gpaDistribution: [],
            yearLevelDistribution: []
        };

        render(<AnalyticsCharts chartData={partialData} />);
        expect(screen.getByText('Enrollment Trends')).toBeInTheDocument();
    });
});
