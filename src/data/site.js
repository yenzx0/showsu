export const contact = {
  whatsappNumber: '5511977434288',
  whatsappDisplay: '(11) 97743-4288',
  phoneSecondary: '5511984882836',
  phoneSecondaryDisplay: '(11) 98488-2836',
  instagramUrl: 'https://www.instagram.com/showsudelicias/',
  instagramHandle: '@showsudelicias',
}

export const whatsappUrl = (message = '') => {
  const baseUrl = `https://wa.me/${contact.whatsappNumber}`
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl
}

export const navItems = [
  { label: 'Início', href: '#inicio' },
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'Como pedir', href: '#como-pedir' },
  { label: 'Sobre nós', href: '#sobre' },
]
