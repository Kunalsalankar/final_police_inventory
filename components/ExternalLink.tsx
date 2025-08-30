import { Link, Href } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { Platform } from 'react-native';

type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
  style?: any;
};

export function ExternalLink({ 
  href, 
  children, 
  asChild = false, 
  className, 
  style 
}: ExternalLinkProps) {
  const isExternal = href.startsWith('http');

  if (!isExternal) {
    return (
      <Link 
        href={href as unknown as Href} 
        asChild={asChild}
        className={className}
        style={style}
      >
        {children}
      </Link>
    );
  }

  const handlePress = async (e: any) => {
    e?.preventDefault?.();
    
    if (Platform.OS === 'web') {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      try {
        await openBrowserAsync(href);
      } catch (error) {
        console.error('Error opening link:', error);
      }
    }
  };

  return (
    <Link
      href={href as unknown as Href}
      onPress={handlePress}
      asChild={asChild}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}
