export const AMENITIES = [
  "Wi-Fi",
  "Audio/Visual Equipment",
  "Stage",
  "Lighting",
  "Heating/Cooling",
  "Restrooms",
  "Catering Services",
  "Bar Services",
  "Kitchen Facilities",
  "Outdoor Space",
  "Parking",
] as const;

export const VENUE_PURPOSE_MAPPING: Record<string, string[]> = {
  "Corporate and Business": [
    "Conference Center",
    "Convention Center",
    "Meeting Room",
    "Boardroom",
    "Training Room",
    "Seminar Hall",
    "Business Center",
    "Coworking Space",
  ],
  "Weddings and Celebration": [
    "Banquet Hall",
    "Ballroom",
    "Wedding Hall",
    "Reception Hall",
    "Garden",
    "Chapel",
    "Event Center",
  ],
  Entertainment: [
    "Theater",
    "Cinema",
    "Concert Hall",
    "Opera House",
    "Comedy Club",
    "Nightclub",
    "Casino",
  ],
  Sport: [
    "Stadium",
    "Arena",
    "Sports Complex",
    "Gymnasium",
    "Indoor Sports Hall",
    "Tennis Court",
    "Golf Club",
    "Swimming Pool",
  ],
  Outdoor: [
    "Park",
    "Beach",
    "Rooftop",
    "Botanical Garden",
    "Farm",
    "Ranch",
    "Campground",
    "Open Field",
    "Amphitheater",
  ],
  Hospitality: [
    "Hotel",
    "Resort",
    "Restaurant",
    "Cafe",
    "Bar",
    "Lounge",
    "Winery",
    "Brewery",
  ],
  Educational: [
    "University Auditorium",
    "School Hall",
    "Lecture Hall",
    "Library",
    "Classroom",
  ],
  Religion: ["Church", "Mosque", "Temple", "Synagogue", "Community Worship Hall"],
  "Community and Government": [
    "Community Center",
    "Civic Center",
    "Town Hall",
    "Cultural Center",
    "Exhibition Center",
  ],
  "Exhibition and Trade": [
    "Exhibition Hall",
    "Trade Fair Center",
    "Gallery",
    "Museum",
  ],
  "Creative and Media": [
    "Studio",
    "Recording Studio",
    "Photography Studio",
    "Art Gallery",
    "Makerspace",
  ],
  Private: ["Private Residence", "Villa", "Mansion", "Apartment", "Vacation Home"],
  "Health and Wellness": ["Spa", "Wellness Center", "Yoga Studio", "Fitness Center"],
  "Unique Venues": [
    "Aquarium",
    "Zoo",
    "Historic Building",
    "Castle",
    "Lighthouse",
    "Ship or Yacht",
    "Cruise Boat",
    "Hangar",
    "Warehouse",
    "Vineyard",
  ],
};

export const VENUE_STATUSES = [
  "available",
  "reserved",
  "booked",
  "under_maintenance",
  "closed",
] as const;

export const EVENT_STATUSES = ["pending", "approved", "rejected"] as const;

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const ROLE_HOME: Record<string, string> = {
  customer: "/venues",
  venue_manager: "/manager/venues",
};
