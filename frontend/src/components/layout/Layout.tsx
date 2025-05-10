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
  Tooltip
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

const drawerWidth = 240;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  href: string;
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', padding: theme.spacing(2) }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            AI Scientist
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Paper Generator
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => {
          const isActive = router.pathname === item.href || 
                           (item.href !== '/' && router.pathname.startsWith(item.href));
          
          return (
            <ListItem key={item.text} disablePadding>
              <Link href={item.href} passHref style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
                <ListItemButton 
                  sx={{
                    bgcolor: isActive ? 'primary.light' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.light' : 'rgba(0, 0, 0, 0.04)',
                    },
                    borderRadius: '0 20px 20px 0',
                    mr: 1,
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.dark' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'primary.dark' : 'text.primary'
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary'
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Tooltip title="GitHub Repository">
            <IconButton 
              sx={{ ml: 1 }}
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
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
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
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
} 