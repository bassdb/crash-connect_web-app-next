import Link from 'next/link'

export default function Logo() {
  return (
    <div>
      <Link href={'/'}>
        <img 
          src='/logo/start-it_logo.svg' 
          alt='Logo' 
          width={128}
          height={64}
          style={{
            width: '128px',
            height: '64px'
          }}
        />
      </Link>
    </div>
  )
}
