// components/VenueRatings.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Card, CardContent } from '@/components/ui/card';

const VenueRatings = ({ venueName }) => {
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch(`/api/venue-ratings?venue=${encodeURIComponent(venueName)}`);
        if (!response.ok) throw new Error('Failed to fetch ratings');
        const data = await response.json();
        setRatings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (venueName) {
      fetchRatings();
    }
  }, [venueName]);

  if (loading) return <CircularProgress />;
  if (error) return null; // Silently fail if ratings aren't available
  if (!ratings) return null;

  const metrics = [
    { label: 'TCUP RATING', value: ratings.overall },
    { label: 'ACCESSIBILITY', value: ratings.accessibility },
    { label: 'COMMUNICATION', value: ratings.communication },
    { label: 'HOSPITALITY', value: ratings.hospitality },
    { label: 'PAYMENT', value: ratings.payment },
    { label: 'SAFETY', value: ratings.safety },
    { label: 'SOUND', value: ratings.sound }
  ];

  return (
    <Card className="w-full max-w-lg bg-white mt-4">
      <CardContent>
        <Typography variant="h6" gutterBottom>Venue Ratings</Typography>
        <div className="grid grid-cols-2 gap-8 p-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                metric.label === 'TCUP RATING' ? 'bg-purple-500 text-white' : 'bg-gray-100'
              }`}>
                <span className="text-2xl font-bold">{metric.value?.toFixed(2) || '-'}</span>
              </div>
              <span className="mt-2 text-sm font-medium text-center">{metric.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VenueRatings;