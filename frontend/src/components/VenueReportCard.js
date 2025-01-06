import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const VenueReportCard = ({ venueData }) => {
  const metrics = [
    { label: 'TCUP RATING', value: venueData?.overall || 0 },
    { label: 'ACCESSIBILITY', value: venueData?.accessibility || 0 },
    { label: 'COMMUNICATION', value: venueData?.communication || 0 },
    { label: 'HOSPITALITY', value: venueData?.hospitality || 0 },
    { label: 'PAYMENT', value: venueData?.payment || 0 },
    { label: 'SAFETY', value: venueData?.safety || 0 },
    { label: 'SOUND', value: venueData?.sound || 0 },
    { label: 'GENERAL', value: venueData?.general || 0 }
  ];

  return (
    <Card className="w-full max-w-lg bg-white">
      <CardHeader>
        <div className="flex flex-col items-center space-y-4">
          <img 
            src="/api/placeholder/100/100"
            alt="TCUP Logo"
            className="w-24 h-24"
          />
          <h1 className="text-3xl font-bold text-center">VENUE REPORT CARD</h1>
          <h2 className="text-2xl font-semibold text-white bg-purple-500 px-8 py-2 rounded-lg">
            {venueData?.name || 'VENUE NAME'}
          </h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-8 p-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                metric.label === 'TCUP RATING' ? 'bg-purple-500 text-white' : 'bg-gray-100'
              }`}>
                <span className="text-2xl font-bold">{metric.value.toFixed(2)}</span>
              </div>
              <span className="mt-2 text-sm font-medium text-center">{metric.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VenueReportCard;