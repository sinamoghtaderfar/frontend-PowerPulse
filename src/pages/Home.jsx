import React, { useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ShowChart as ChartIcon,
  Timeline as TimelineIcon,
  ElectricBolt as BoltIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const LightningCanvas = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    class Particle {
      constructor(x, y, speedX, speedY, size, color) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.size = size;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.005;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        return this.alpha > 0;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const createLightningBolt = (x1, y1, x2, y2, displacement = 15) => {
      const points = [];
      points.push({ x: x1, y: y1 });
      
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const segments = Math.floor(distance / 20);
      
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * displacement;
        const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * displacement;
        points.push({ x, y });
      }
      
      points.push({ x: x2, y: y2 });
      return points;
    };

    // تابع رسم جرقه
    const drawLightning = (points, thickness = 2, color = '#7c3aed') => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.stroke();
      ctx.restore();

      // ایجاد ذرات نور در انتهای جرقه
      const lastPoint = points[points.length - 1];
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push(
          new Particle(
            lastPoint.x,
            lastPoint.y,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            Math.random() * 3 + 1,
            color
          )
        );
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      if (Math.random() < 0.1) {
        const x1 = Math.random() * canvas.width;
        const y1 = Math.random() * 50;
        const x2 = x1 + (Math.random() - 0.5) * 200;
        const y2 = y1 + 100 + Math.random() * 100;
        
        const points = createLightningBolt(x1, y1, x2, y2, 25);
        drawLightning(points, 3, '#c084fc');
      }

      const sideLightnings = [
        { x: 0, y: 0, width: 100, height: canvas.height, color: '#7c3aed' },
        { x: canvas.width - 100, y: 0, width: 100, height: canvas.height, color: '#a78bfa' }
      ];

      sideLightnings.forEach(side => {
        if (Math.sin(time * 2 + side.x) > 0.8) {
          const y1 = side.y + Math.random() * side.height;
          const y2 = y1 + 80 + Math.random() * 120;
          const points = createLightningBolt(side.x, y1, side.x + side.width, y2, 15);
          drawLightning(points, 2, side.color);
        }
      });

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update();
        particle.draw(ctx);
        return particle.alpha > 0;
      });

      // ایجاد ذرات جدید
      if (particlesRef.current.length < 100) {
        particlesRef.current.push(
          new Particle(
            Math.random() * canvas.width,
            Math.random() * 100,
            (Math.random() - 0.5) * 0.5,
            Math.random() * 2,
            Math.random() * 2 + 0.5,
            `hsl(${280 + Math.random() * 40}, 100%, ${70 + Math.random() * 20}%)`
          )
        );
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // شروع انیمیشن
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};

const FeatureCard = ({ icon, title, description, path, delay }) => {
  const theme = useTheme();
  const cardRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      ref={cardRef}
    >
      <Card
        sx={{
          height: '100%',
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(138, 43, 226, 0.25)',
          borderRadius: 4,
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-12px)',
            boxShadow: '0 20px 40px rgba(138, 43, 226, 0.25)',
            borderColor: '#9f7aea',
            '&::before': {
              opacity: 1,
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #7c3aed, #c084fc, #a78bfa)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
        }}
      >
        <CardHeader
          avatar={icon}
          title={
            <Typography variant="h6" fontWeight="bold" color="#e0d0ff">
              {title}
            </Typography>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="grey.400" sx={{ mb: 3, minHeight: 80 }}>
            {description}
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            component={RouterLink}
            to={path}
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderColor: '#9f7aea',
              color: '#d1b8ff',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(159, 122, 234, 0.3), transparent)',
                transition: 'left 0.6s ease',
              },
              '&:hover': {
                bgcolor: 'rgba(159, 122, 234, 0.15)',
                borderColor: '#c084fc',
                '&::before': {
                  left: '100%',
                },
              },
            }}
          >
            Try Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Home() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: { xs: 10, md: 12 },
        pb: 12,
        background: 'radial-gradient(circle at 20% 30%, #0f001a 0%, #000000 70%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background blobs */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, -20, 0],
          y: [0, -40, 60, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 400,
          height: 400,
          bgcolor: 'rgba(138, 43, 226, 0.07)',
          borderRadius: '50%',
          filter: 'blur(90px)',
          zIndex: 0,
        }}
      />

      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -50, 20, 0],
          y: [0, 30, -50, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '8%',
          width: 500,
          height: 500,
          bgcolor: 'rgba(126, 58, 242, 0.06)',
          borderRadius: '50%',
          filter: 'blur(110px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Hero Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 14 },
          }}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <Typography
              variant="h2"
              component="h1"
              fontWeight="900"
              sx={{
                fontSize: { xs: '2.8rem', md: '4.8rem' },
                background: 'linear-gradient(90deg, #c084fc, #a78bfa, #7c3aed, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: 'gradientFlow 12s ease infinite',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                mb: 3,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '200px',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #7c3aed, #c084fc, transparent)',
                  borderRadius: '2px',
                },
              }}
            >
              PowerPulse Forecasting
            </Typography>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <Typography
              variant="h5"
              color="grey.300"
              sx={{
                maxWidth: 780,
                mx: 'auto',
                mb: 5,
                lineHeight: 1.7,
              }}
            >
              Advanced time series forecasting powered by cutting-edge machine learning models.
              <br />
              Predict energy demand, prices, and trends with confidence.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/forecastprophet"
              sx={{
                px: 6,
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #7c3aed, #a78bfa)',
                boxShadow: '0 8px 30px rgba(124, 58, 237, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '0',
                  height: '0',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translate(-50%, -50%)',
                  transition: 'width 0.6s ease, height 0.6s ease',
                },
                '&:hover': {
                  background: 'linear-gradient(45deg, #9f7aea, #c084fc)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 40px rgba(159, 122, 234, 0.5)',
                  '&::before': {
                    width: '300px',
                    height: '300px',
                  },
                },
              }}
            >
              Start Forecasting Now
            </Button>
          </motion.div>
        </Box>

        {/* Electric Section با Canvas */}
        <Box
          sx={{
            position: 'relative',
            py: 8,
            mb: 2,
            height: { xs: 'auto', md: 600 },
            overflow: 'hidden',
            borderRadius: 4,
            border: '1px solid rgba(124, 58, 237, 0.1)',
            background: 'linear-gradient(180deg, rgba(15, 0, 26, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
          }}
        >
          <LightningCanvas />

          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              mb: 8,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Typography
                variant="h3"
                fontWeight="900"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: 'linear-gradient(90deg, #c084fc, #a78bfa, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  position: 'relative',
                  display: 'inline-block',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-10px',
                    left: '-20px',
                    right: '-20px',
                    bottom: '-10px',
                    background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.1), rgba(159, 122, 234, 0.1))',
                    filter: 'blur(20px)',
                    zIndex: -1,
                    borderRadius: '20px',
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <motion.span
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    ⚡
                  </motion.span>
                  Choose Your Forecasting Engine
                  <motion.span
                    animate={{
                      rotate: [360, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    ⚡
                  </motion.span>
                </Box>
              </Typography>
            </motion.div>

            <Typography
              variant="h6"
              color="grey.300"
              sx={{
                mt: 3,
                maxWidth: 600,
                mx: 'auto',
                textShadow: '0 0 10px rgba(124, 58, 237, 0.5)',
              }}
            >
              Select from our cutting-edge AI models to power your predictions
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ position: 'relative', zIndex: 2 }}>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }}
                  >
                    <ChartIcon 
                      sx={{ 
                        fontSize: 50, 
                        color: '#c084fc',
                        filter: 'drop-shadow(0 0 8px rgba(192, 132, 252, 0.5))',
                      }} 
                    />
                  </motion.div>
                }
                title={
                  <motion.span
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(192, 132, 252, 0.5)',
                        '0 0 20px rgba(192, 132, 252, 0.8)',
                        '0 0 10px rgba(192, 132, 252, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    Prophet Forecast
                  </motion.span>
                }
                description="Facebook's Prophet – excellent for handling seasonality, holidays, and missing data with interpretable results."
                path="/forecastprophet"
                delay={0.2}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }}
                  >
                    <TimelineIcon 
                      sx={{ 
                        fontSize: 50, 
                        color: '#a78bfa',
                        filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))',
                      }} 
                    />
                  </motion.div>
                }
                title={
                  <motion.span
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(167, 139, 250, 0.5)',
                        '0 0 20px rgba(167, 139, 250, 0.8)',
                        '0 0 10px rgba(167, 139, 250, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.3,
                    }}
                  >
                    XGBoost Forecast
                  </motion.span>
                }
                description="High-performance gradient boosting model – captures complex non-linear patterns and feature interactions exceptionally well."
                path="/forecastxGBoost"
                delay={0.4}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }}
                  >
                    <BoltIcon 
                      sx={{ 
                        fontSize: 50, 
                        color: '#9f7aea',
                        filter: 'drop-shadow(0 0 12px rgba(159, 122, 234, 0.7))',
                      }} 
                    />
                  </motion.div>
                }
                title={
                  <motion.span
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(159, 122, 234, 0.5)',
                        '0 0 25px rgba(159, 122, 234, 1)',
                        '0 0 10px rgba(159, 122, 234, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.6,
                    }}
                  >
                    Random Forest Forecast
                  </motion.span>
                }
                description="Robust ensemble method – great generalization, handles outliers, and provides feature importance for better understanding."
                path="/forecastRandom"
                delay={0.6}
              />
            </Grid>
          </Grid>

          <Box
            component={motion.div}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100px',
              background: 'linear-gradient(180deg, transparent, rgba(124, 58, 237, 0.1))',
              filter: 'blur(20px)',
              zIndex: 1,
            }}
          />
        </Box>

        {/* Final CTA */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          sx={{
            textAlign: 'center',
            mt: 10,
            py: 10,
            px: 4,
            borderRadius: 6,
            bgcolor: 'rgba(15, 0, 26, 0.6)',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #7c3aed, #c084fc, #a78bfa)',
            },
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="#e0d0ff" gutterBottom>
            Ready to Predict the Future?
          </Typography>
          <Typography variant="h6" color="grey.400" sx={{ mb: 4 }}>
            Choose the model that best fits your data and start generating accurate forecasts today.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/forecastprophet"
            sx={{
              px: 7,
              py: 1.8,
              background: 'linear-gradient(90deg, #7c3aed, #c084fc)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                transition: 'left 0.6s ease',
              },
              '&:hover': { 
                background: 'linear-gradient(90deg, #9f7aea, #d1b8ff)',
                '&::before': {
                  left: '100%',
                },
              },
            }}
          >
            Launch Prophet Demo
          </Button>
        </Box>
      </Container>

      {/* Keyframes for gradient animation */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes gradientFlow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `,
        }}
      />
    </Box>
  );
}