export interface AgencyData {
  id: string; name: string; slug: string; website: string; description: string;
  services: string[]; rating: number; featured: boolean;
  stateSlug: string; citySlug: string; localitySlug: string;
}
export interface LocalityMeta {
  localityName: string; cityName: string; stateName: string;
}
export interface KeywordData {
  term: string; slug: string; description: string; content: string;
}
export interface Subtopic {
  heading: string; content: string; children?: Subtopic[];
}
