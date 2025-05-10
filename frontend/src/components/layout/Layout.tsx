import React, { useState, ReactNode } from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  useMediaQuery,
  Avatar,
  Tooltip,
  CircularProgress,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import GitHubIcon from '@mui/icons-material/GitHub';
import Link from 'next/link';
import { useRouter } from 'next/router';

const drawerWidth = 280;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/'
  },
  {
    text: 'Research Ideas',
    icon: <LightbulbIcon />,
    href: '/ideas'
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    href: '/settings'
  }
];

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'AI Scientist Paper Generator' }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Handle route change events
  React.useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: theme.spacing(3),
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main,
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <LightbulbIcon sx={{ fontSize: 28 }} />
            AI Scientist
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
            Paper Generator
          </Typography>
        </Box>
      </Toolbar>
      <List sx={{ px: 2, py: 1 }}>
        {navItems.map((item) => {
          const isActive = router.pathname === item.href || 
                           (item.href !== '/' && router.pathname.startsWith(item.href));
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <Link href={item.href} passHref style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
                <ListItemButton 
                  sx={{
                    bgcolor: isActive ? 'primary.light' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.light' : 'rgba(136, 158, 115, 0.08)',
                    },
                    borderRadius: 2,
                    py: 1.5,
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? 'primary.dark' : 'text.secondary',
                    minWidth: 40
                  }}>
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="primary">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'primary.dark' : 'text.primary',
                      fontSize: '0.95rem'
                    }} 
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          zIndex: theme.zIndex.drawer + 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {title}
          </Typography>
          {isLoading && (
            <CircularProgress size={24} sx={{ mr: 2, color: 'primary.main' }} />
          )}
          <Tooltip title="GitHub Repository">
            <IconButton 
              sx={{ 
                ml: 1,
                color: 'text.secondary',
                '&:hover': { 
                  color: 'primary.main',
                  bgcolor: 'rgba(136, 158, 115, 0.08)'
                }
              }}
              component="a"
              href="https://github.com/TannedCung/AI-Scientist-UI"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="User Profile">
            <IconButton sx={{ ml: 1 }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 32, 
                height: 32,
                '&:hover': { bgcolor: 'primary.dark' }
              }}>
                <PersonIcon fontSize="small" />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation menu"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          position: 'relative',
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default'
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              zIndex: theme.zIndex.drawer - 1
            }}
          >
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
} 