export const getVarietiesForSpecies = (species: string) => {
  const varietyMap: Record<string, Array<{ value: string; label: string }>> = {
    strawberry: [
      { value: 'Elsanta', label: 'Elsanta' },
      { value: 'Sonata', label: 'Sonata' },
      { value: 'Albion', label: 'Albion' },
    ],
    tomato: [
      { value: 'Cherry', label: 'Cherry' },
      { value: 'Beefsteak', label: 'Beefsteak' },
      { value: 'Roma', label: 'Roma' },
    ],
    lettuce: [
      { value: 'Iceberg', label: 'Iceberg' },
      { value: 'Romaine', label: 'Romaine' },
      { value: 'Butterhead', label: 'Butterhead' },
    ],
    basil: [
      { value: 'Genovese', label: 'Genovese' },
      { value: 'Thai', label: 'Thai Basil' },
      { value: 'Purple', label: 'Purple Basil' },
    ],
    pepper: [
      { value: 'California', label: 'California Wonder' },
      { value: 'Bell', label: 'Bell Pepper' },
      { value: 'Jalapeno', label: 'Jalapeño' },
    ],
  }

  return varietyMap[species] || []
}

export const speciesOptions = [
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'tomato', label: 'Tomato' },
  { value: 'lettuce', label: 'Lettuce' },
  { value: 'basil', label: 'Basil' },
  { value: 'pepper', label: 'Pepper' },
]

export const greenhouseOptions = [
  { value: 'gh1', label: 'GH1' },
  { value: 'gh2', label: 'GH2' },
]