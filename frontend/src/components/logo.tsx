import { Link } from 'react-router-dom';

interface LogoProps {
  image: string;
}

export function Logo({ image }: LogoProps) {
  return (
    <Link to='/' className='flex items-center justify-center'>
      <div className='relative size-8 flex items-center justify-center'>
        <img
          src={image || '/placeholder.svg'}
          alt='Logo'
          className='size-full object-contain aspect-square'
        />
      </div>
    </Link>
  );
}
