export const getUserRole = async (jwt: string) => {
  if (!jwt) return null
  const [header, payload, signature] = jwt.split('.')

  //   const decodedHeader = JSON.parse(atob(header))
  const decodedPayload = JSON.parse(atob(payload))
  // console.log(decodedPayload)

  return {
    payload: decodedPayload,
  }
}
