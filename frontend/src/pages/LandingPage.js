import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useMediaQuery,
  useTheme
} from '@mui/material';

const HeroBackground = () => (
  <Box sx={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0
  }}>
    <motion.div
      animate={{
        background: [
          'radial-gradient(circle at 20% 20%, #1a1240 0%, #000000 100%)',
          'radial-gradient(circle at 80% 80%, #1a1240 0%, #000000 100%)',
          'radial-gradient(circle at 20% 20%, #1a1240 0%, #000000 100%)'
        ]
      }}
      transition={{ duration: 10, repeat: Infinity }}
      style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
        filter: 'blur(50px)'
      }}
    />
    <motion.div
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 5, repeat: Infinity }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("/api/placeholder/400/300")',
        backgroundSize: 'cover',
        opacity: 0.1
      }}
    />
  </Box>
);

const NewsCard = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)'
      }}>
        <CardMedia
          component="img"
          height="200"
          image={item.image}
          alt={item.title}
        />
        <CardContent>
          <motion.div
            animate={{ y: isHovered ? -5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Typography variant="h6" gutterBottom>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.date}
            </Typography>
          </motion.div>
        </CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            color: 'white'
          }}
        >
          <Typography variant="body2">Click to learn more →</Typography>
        </motion.div>
      </Card>
    </motion.div>
  );
};


const ActionButton = ({ text }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Button
      variant="outlined"
      fullWidth
      sx={{
        color: '#ff9b9b',
        borderColor: '#ff9b9b',
        py: 2,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: '#ff7b7b',
          '&::after': {
            opacity: 0.1
          }
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent, #ff9b9b, transparent)',
          opacity: 0,
          transition: 'opacity 0.3s'
        }
      }}
    >
      {text}
    </Button>
  </motion.div>
);

const FloatingImages = () => {
    const images = [
      'https://res.cloudinary.com/dsll3ms2c/image/upload/v1738623284/Screenshot_2025-02-03_at_4.52.25_PM_pwrkd5.png', // Replace with your actual image paths
      'https://res.cloudinary.com/dsll3ms2c/image/upload/v1738623284/Screenshot_2025-02-03_at_4.53.30_PM_o4rxju.png',
      'https://res.cloudinary.com/dsll3ms2c/image/upload/v1738623243/Screenshot_2025-02-03_at_4.53.52_PM_j5o6dv.png',
      'https://res.cloudinary.com/dsll3ms2c/image/upload/v1738623116/Screenshot_2025-02-03_at_4.51.52_PM_k97sbj.png',
      'https://res.cloudinary.com/dsll3ms2c/image/upload/v1736177451/Screenshot_2025-01-06_at_9.30.44_AM_vfj5yt.png'
    ];
  
    return (
        <Box sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          background: '#1a1240',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(rgba(26,18,64,0.3), rgba(26,18,64,0.5))',
            zIndex: 1
          }
        }}>
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: 100 + (i * 200), 
                y: 100 + (i * 100),
                opacity: 0.7 
              }}
              animate={{
                x: [100 + (i * 200), 150 + (i * 200), 100 + (i * 200)],
                y: [100 + (i * 100), 150 + (i * 100), 100 + (i * 100)],
                rotate: [-5, 5, -5]
              }}
              transition={{
                duration: 10 + (i * 2),
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                width: '300px',
                height: '200px',
                borderRadius: '10px',
                overflow: 'hidden'
              }}
            >
              <Box
                component="img"
                src={img}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(30%)'
                }}
              />
            </motion.div>
          ))}
        </Box>
      );
    };

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <FloatingImages />

      {/* Hero Section */}
      <Box sx={{ 
        minHeight: '100vh',
        position: 'relative',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        px: 2
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 'bold',
              mb: 3,
              lineHeight: 1.2
            }}>
              TWIN CITIES
              <br />
              UNITED PERFORMERS
            </Typography>
            
            <motion.div
              animate={{ 
                color: ['#ff9b9b', '#ffb74d', '#ff9b9b'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Typography variant="h4" sx={{ 
                mb: 4,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                Building Community Through Music
              </Typography>
            </motion.div>

            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="contained"
                    fullWidth
                    sx={{ 
                      bgcolor: '#ff9b9b',
                      color: '#1a1240',
                      py: 2,
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: '#ff7b7b' }
                    }}
                  >
                    JOIN THE MOVEMENT
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* News Section with Parallax */}
      <Box sx={{ 
        bgcolor: 'rgba(255,255,255,0.95)',
        py: 8,
        position: 'relative'
      }}>


        <Container>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" sx={{ 
              textAlign: 'center', 
              mb: 6,
              color: '#1a1240'
            }}>
              NEWS
            </Typography>
          </motion.div>
          
          <Grid container spacing={4}>
            {newsItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <NewsCard item={item} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box sx={{ bgcolor: '#1a1240', py: 6, position: 'relative' }}>
        <Container>
          <Grid container spacing={3}>
            {actions.map((action, index) => (
              <Grid item xs={12} md={4} key={index}>
                <ActionButton text={action} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Subtle Login Link */}
      <Box sx={{ 
        position: 'fixed', 
        top: 20, 
        right: 20,
        zIndex: 10
      }}>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="text" 
              sx={{ 
                color: 'white',
                opacity: 0.7,
                '&:hover': { opacity: 1 }
              }}
            >
              Member Login
            </Button>
          </motion.div>
        </Link>
      </Box>
    </Box>
  );
};

const newsItems = [
  {
    title: "Monthly Community Meeting",
    date: "February 17, 2024",
    image: "/api/placeholder/400/300"
  },
  {
    title: "Venue Report Card Launch",
    date: "February 10, 2024",
    image: "/api/placeholder/400/300"
  },
  {
    title: "Power Pledge Campaign",
    date: "February 1, 2024",
    image: "/api/placeholder/400/300"
  }
];

const actions = [
  "SIGN THE POWER PLEDGE",
  "FILL OUT A VENUE REPORT CARD",
  "JOIN OUR SLACK"
];

export default LandingPage;