import MagicLinkForm from './magic-link-form'

export default async function Login() {
  return (
    <div className='flex flex-col grow justify-center items-center'>
      <MagicLinkForm />
    </div>
  )
}
