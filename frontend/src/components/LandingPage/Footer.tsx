const YEAR = new Date().getFullYear();

const LINKS = [
  { title: 'Home', href: '#' },
  { title: 'Features', href: '#features' },
  { title: 'Documentation', href: '/docs' },
  { title: 'GitHub', href: 'https://github.com/ni3rav/hive' },
];

export default function Footer() {
  return (
    <footer className='w-full border-t pb-8 pt-16'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-row flex-wrap items-center justify-center gap-x-10 gap-y-3 border-t border-border pt-8 text-center md:justify-between'>
          <p className='text-foreground text-sm'>
            Copyright &copy; {YEAR} Hive
          </p>
          <ul className='flex flex-wrap items-center justify-center gap-6'>
            {LINKS.map(({ title, href }, key) => (
              <li key={key}>
                <a
                  href={href}
                  className='text-foreground hover:text-primary text-sm transition-colors'
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
