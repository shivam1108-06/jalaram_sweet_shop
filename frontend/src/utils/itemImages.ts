// Image mapping for Indian sweets
// Using Wikipedia redirect URLs that automatically resolve to correct Wikimedia Commons images
// These URLs redirect to the actual image with proper sizing

const itemImages: Record<string, string> = {
  // Popular Milk Sweets (Featured)
  'Gulab Jamun': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Bowl_of_Gulab_Jamun.JPG?width=400',
  'Rasgulla': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Rasgulla_Image.JPG?width=400',
  'Rasmalai': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Rasmalai_-_the_King_of_Indian_Sweets.JPG?width=400',
  'Cham Cham': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Cherry_Chamcham.jpg/500px-Cherry_Chamcham.jpg?width=400',
  'Imarti': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Imarti.jpg?width=400',

  // Dry Sweets
  'Kaju Katli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Kaju_katli_sweet.jpg/240px-Kaju_katli_sweet.jpg?width=400',
  'Soan Papdi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Son_papadi.jpg/500px-Son_papadi.jpg?width=400',
  'Kaju Roll': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Kaju_katli.JPG?width=400',
  'Mohanthal': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Mohanthal.jpg?width=400',
  'Besan Ladoo': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Besan_ladoo.JPG?width=400',
  'Motichoor Ladoo': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Motichoor_ladoo.jpg?width=400',
  'Peda': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Mathura_peda.jpg?width=400',
  'Barfi': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Barfi.JPG?width=400',
  'Kalakand': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Kalakand.JPG?width=400',
  'Milk Cake': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Kalakand.JPG?width=400',

  // Special/Other Sweets
  'Jalebi': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Jalebi_-_Served_in_a_Plate.JPG?width=400',
  'Ghevar': 'https://en.wikipedia.org/wiki/Special:Redirect/file/Ghevar.jpg?width=400',
}

// Default image for items not in the mapping - assorted Indian sweets
const defaultImage = 'https://en.wikipedia.org/wiki/Special:Redirect/file/Assorted_Sweets_-_Mehsana_-_Gujarat_-_1.jpg?width=400'

export function getItemImage(itemName: string): string {
  return itemImages[itemName] || defaultImage
}

export default itemImages
