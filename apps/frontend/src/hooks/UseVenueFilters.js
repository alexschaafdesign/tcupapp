export const useVenueFilters = () => {
    const [venues, setVenues] = useState([]);
    const [filteredVenues, setFilteredVenues] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Fetch both venue data and ratings in parallel
          const [venuesResponse, ratingsResponse] = await Promise.all([
            fetch(`${process.env.REACT_APP_API_URL}/venues`),
            fetch(`${process.env.REACT_APP_API_URL}/venue-ratings`)
          ]);
  
          const venuesData = await venuesResponse.json();
          const ratingsData = await ratingsResponse.json();
  
          // Combine venue data with ratings
          const combinedData = venuesData.map(venue => ({
            ...venue,
            ratings: ratingsData.find(r => r.venueName.toLowerCase() === venue.venue.toLowerCase())
          }));
  
          setVenues(combinedData);
          setFilteredVenues(combinedData);
        } catch (error) {
          console.error('Error:', error);
        }
        setLoading(false);
      };
  
      fetchData();
    }, []);
  
    return { venues: filteredVenues, loading };
  };