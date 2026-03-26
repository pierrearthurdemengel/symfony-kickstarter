// Variantes de skeleton
type SkeletonVariant = 'text' | 'circle' | 'rectangle';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}: SkeletonProps) {
  // Classes selon la variante
  const variantClasses: Record<SkeletonVariant, string> = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
  };

  // Styles dynamiques pour les dimensions
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  // Dimensions par defaut pour circle
  if (variant === 'circle' && !width) style.width = '2.5rem';
  if (variant === 'circle' && !height) style.height = '2.5rem';

  // Dimensions par defaut pour rectangle
  if (variant === 'rectangle' && !height) style.height = '6rem';

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-secondary-200 dark:bg-gray-700 ${variantClasses[variant]} ${className}`}
          style={style}
        />
      ))}
    </>
  );
}
