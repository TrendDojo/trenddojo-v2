/**
 * Central Icon Registry
 *
 * Single source of truth for all icons in the application.
 * All icons should be registered here for consistent sizing and theming.
 */

import React from 'react';
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  Lock,
  CheckCircle,
  Info,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Plus,
  Play,
  Pause,
  Download,
  Upload,
  Settings,
  Search,
  Filter,
  X,
  Menu,
  MoreVertical,
  MoreHorizontal,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  Check,
  Minus,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Clock,
  User,
  Users,
  Home,
  FileText,
  Folder,
  Save,
  RefreshCw,
  LogOut,
  LogIn,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Heart,
  Star,
  Bookmark,
  Share2,
  Link,
  ExternalLink,
  Zap,
  Award,
  Flag,
  MapPin,
  Navigation,
  Compass,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  HardDrive,
  Cpu,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Cloud,
  CloudOff,
  Sun,
  Moon,
  Loader,
  Gauge,
  ArrowUpWideNarrow,
  Atom,
  ArrowRightLeft,
  CreditCard,
  type LucideIcon
} from 'lucide-react';

/**
 * Centralized size configuration
 * Change these values to update icon sizes globally
 */
export const iconSizes = {
  xs: 'w-4 h-4',      // 1rem - inline text, small buttons
  sm: 'w-5 h-5',      // 1.25rem - standard buttons
  md: 'w-7 h-7',      // 1.75rem - navigation/standard icons
  lg: 'w-9 h-9',      // 2.25rem - alerts/featured sections
  xl: 'w-12 h-12'     // 3rem - hero/display
} as const;

export type IconSize = keyof typeof iconSizes;

/**
 * Icon Registry - Organized by category
 * Add new icons here and they'll be available throughout the app
 */
export const Icons = {
  // Alert & Status Icons
  alert: {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle,
    circle: AlertCircle,
  },

  // Status & Security Icons
  status: {
    shield: Shield,
    lock: Lock,
    lockOpen: Lock, // Could add LockOpen when needed
    activity: Activity,
    target: Target,
  },

  // Trading & Finance Icons
  trading: {
    trendingUp: TrendingUp,
    trendingDown: TrendingDown,
    dollarSign: DollarSign,
    barChart: BarChart,
    lineChart: LineChart,
    pieChart: PieChart,
    creditCard: CreditCard,
  },

  // Navigation Icons
  navigation: {
    chevronDown: ChevronDown,
    chevronRight: ChevronRight,
    chevronLeft: ChevronLeft,
    chevronUp: ChevronUp,
    menu: Menu,
    moreVertical: MoreVertical,
    moreHorizontal: MoreHorizontal,
    home: Home,
    compass: Compass,
    mapPin: MapPin,
    navigation: Navigation,
    externalLink: ExternalLink,
    gauge: Gauge,
    arrowUpWideNarrow: ArrowUpWideNarrow,
    atom: Atom,
    arrowRightLeft: ArrowRightLeft,
  },

  // Action Icons
  action: {
    plus: Plus,
    minus: Minus,
    close: X,
    check: Check,
    edit: Edit,
    trash: Trash2,
    copy: Copy,
    save: Save,
    download: Download,
    upload: Upload,
    refresh: RefreshCw,
    search: Search,
    filter: Filter,
    eye: Eye,
    eyeOff: EyeOff,
    share: Share2,
    link: Link,
  },

  // Media Control Icons
  media: {
    play: Play,
    pause: Pause,
  },

  // User & Account Icons
  user: {
    user: User,
    users: Users,
    logIn: LogIn,
    logOut: LogOut,
    settings: Settings,
  },

  // Communication Icons
  communication: {
    bell: Bell,
    bellOff: BellOff,
    mail: Mail,
    messageSquare: MessageSquare,
  },

  // Social & Engagement Icons
  social: {
    heart: Heart,
    star: Star,
    bookmark: Bookmark,
    award: Award,
    flag: Flag,
  },

  // File & Folder Icons
  file: {
    fileText: FileText,
    folder: Folder,
  },

  // Device Icons
  device: {
    monitor: Monitor,
    smartphone: Smartphone,
    tablet: Tablet,
    laptop: Laptop,
    hardDrive: HardDrive,
    cpu: Cpu,
  },

  // System & Network Icons
  system: {
    wifi: Wifi,
    wifiOff: WifiOff,
    battery: Battery,
    batteryCharging: BatteryCharging,
    cloud: Cloud,
    cloudOff: CloudOff,
    zap: Zap,
    globe: Globe,
  },

  // Theme Icons
  theme: {
    sun: Sun,
    moon: Moon,
  },

  // UI State Icons
  ui: {
    loader: Loader,
    calendar: Calendar,
    clock: Clock,
  },
} as const;

/**
 * Icon Component Props
 */
interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon;
  size?: IconSize | number;
  className?: string;
}

/**
 * Reusable Icon Component
 * Applies consistent sizing and styling to all icons
 *
 * @param size - Can be a preset size ('xs', 'sm', 'md', 'lg', 'xl') or a number in pixels
 * @example
 * <Icon icon={Icons.alert.info} size="md" />
 * <Icon icon={Icons.alert.info} size={24} />
 */
export function Icon({
  icon: IconComponent,
  size = 'md',
  className = '',
  ...props
}: IconProps) {
  // Handle both preset sizes and custom pixel values
  const sizeClass = typeof size === 'string'
    ? iconSizes[size]
    : undefined;

  const sizeStyle = typeof size === 'number'
    ? { width: `${size}px`, height: `${size}px` }
    : undefined;

  return (
    <IconComponent
      className={`${sizeClass || ''} flex-shrink-0 ${className}`}
      style={sizeStyle}
      {...props}
    />
  );
}

/**
 * Helper to get icon by path (e.g., "alert.warning")
 */
export function getIcon(path: string): LucideIcon | undefined {
  const keys = path.split('.');
  let result: any = Icons;

  for (const key of keys) {
    result = result?.[key];
    if (!result) return undefined;
  }

  return result as LucideIcon;
}

/**
 * Type-safe icon paths
 */
export type IconPath = {
  [K in keyof typeof Icons]: {
    [P in keyof typeof Icons[K]]: `${K}.${P & string}`
  }[keyof typeof Icons[K]]
}[keyof typeof Icons];

/**
 * Get all available icon paths (useful for theme page)
 */
export function getAllIconPaths(): Array<{ path: string; icon: LucideIcon; category: string }> {
  const paths: Array<{ path: string; icon: LucideIcon; category: string }> = [];

  Object.entries(Icons).forEach(([category, icons]) => {
    Object.entries(icons).forEach(([name, icon]) => {
      paths.push({
        path: `${category}.${name}`,
        icon: icon as LucideIcon,
        category
      });
    });
  });

  return paths;
}

/**
 * Export individual icon components for backward compatibility
 * and direct usage where needed
 */
export const {
  alert: AlertIcons,
  status: StatusIcons,
  trading: TradingIcons,
  navigation: NavigationIcons,
  action: ActionIcons,
  media: MediaIcons,
  user: UserIcons,
  communication: CommunicationIcons,
  social: SocialIcons,
  file: FileIcons,
  device: DeviceIcons,
  system: SystemIcons,
  theme: ThemeIcons,
  ui: UIIcons,
} = Icons;