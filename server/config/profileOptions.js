const INTERESTS = [
    // 🎵 Music
    "Listening to Music", "Playing Guitar", "Playing Piano", "Singing", "DJing",
    "Going to Concerts", "Making Music", "Classical Music", "Hip Hop", "Jazz",
    "Nasheed", "Qawwali", "Folk Music",

    // 🎬 Movies & TV
    "Watching Movies", "Binge Watching", "Documentaries", "Anime", "Comedy Shows",
    "Drama Series", "Horror Movies", "Action Movies", "Islamic Lectures", "Podcasts",

    // 📚 Reading & Learning
    "Reading Books", "Islamic Books", "Self Help", "Biography", "Poetry",
    "Fiction", "Non-Fiction", "Quran Recitation", "Learning New Skills",
    "Online Courses", "History", "Philosophy", "Science",

    // 🍔 Food & Cooking
    "Cooking", "Baking", "Trying New Restaurants", "BBQ", "Desi Food",
    "Biryani Lover", "Street Food", "Vegetarian Food", "Healthy Eating",
    "Meal Prepping", "Coffee Lover", "Tea Lover",

    // 🏋️ Fitness & Sports
    "Gym", "Running", "Cycling", "Swimming", "Yoga", "Hiking",
    "Cricket", "Football", "Basketball", "Badminton", "Tennis",
    "Squash", "Table Tennis", "Martial Arts", "Boxing", "Wrestling",
    "Volleyball", "Fitness", "Weight Training", "Crossfit", "Pilates",

    // ✈️ Travel
    "Travelling", "Road Trips", "Backpacking", "Beach Holidays",
    "Mountain Trekking", "Exploring New Cities", "Cultural Tourism",
    "Religious Tourism", "Photography", "Adventure Travel",

    // 🎨 Arts & Creativity
    "Drawing", "Painting", "Calligraphy", "Photography", "Videography",
    "Graphic Design", "Interior Design", "Fashion", "DIY Crafts",
    "Writing", "Blogging", "Journaling", "Content Creation",

    // 💻 Technology & Gaming
    "Technology", "Programming", "Gaming", "Mobile Games", "PC Gaming",
    "Console Gaming", "Esports", "Crypto", "AI & Machine Learning",
    "Social Media", "App Development", "Web Design",

    // 🌿 Nature & Outdoors
    "Gardening", "Camping", "Bird Watching", "Fishing", "Horse Riding",
    "Nature Walks", "Star Gazing", "Farming", "Sustainability",

    // 🕌 Faith & Spirituality
    "Islamic Studies", "Quran Learning", "Hadith Studies", "Fiqh",
    "Attending Lectures", "Volunteering", "Charity Work", "Community Service",
    "Dawah", "Attending Masjid", "Dhikr", "Spiritual Growth",

    // 👨‍👩‍👧 Family & Social
    "Spending Time with Family", "Parenting", "Mentoring", "Socialising",
    "Board Games", "Card Games", "Family Gatherings", "Community Events",
    "Attending Weddings", "Hosting Dinners",

    // 💼 Career & Business
    "Entrepreneurship", "Investing", "Real Estate", "Stock Market",
    "Business Development", "Networking", "Public Speaking", "Leadership",
    "Startups", "Finance",

    // 🧠 Mindfulness & Wellness
    "Meditation", "Mental Health Awareness", "Journaling", "Mindfulness",
    "Self Care", "Therapy", "Breathing Exercises", "Cold Therapy",

    // 🐾 Animals
    "Pet Lover", "Cat Person", "Dog Person", "Bird Keeping",
    "Animal Welfare", "Aquarium", "Horse Lover",

    // 🎭 Entertainment & Fun
    "Stand-up Comedy", "Magic Tricks", "Karaoke", "Trivia Nights",
    "Escape Rooms", "Theme Parks", "Museums", "Art Galleries",
]

const OPTIONS = {

    religions: ["Muslim", "Christian", "Hindu", "Jewish", "Buddhist", "Sikh", "Other"],
    sects: [
        "Sunni", "Shia", "Deobandi", "Barelvi", "Ahmadi", "Salafi",
        "Hanafi", "Maliki", "Shafi'i", "Hanbali", "Ismaili", "Bohra",
        "Ahl-e-Hadith", "Other"
    ],
    mother_tongues: [
        "Urdu", "Pashto", "Punjabi", "Sindhi", "Balochi", "Saraiki",
        "Hindko", "Kashmiri", "Brahui", "English", "Arabic", "Bengali",
        "Tamil", "Malayalam", "Other"
    ],

    interests: INTERESTS,


    marital_statuses: ["Never Married", "Divorced", "Widowed", "Separated"],

    education_levels: [
        "Primary", "Middle School", "High School", "Intermediate", "Diploma",
        "Bachelor's", "Master's", "PhD", "Other"
    ],

    body_types: ["Slim", "Athletic", "Average", "Curvy", "Heavy"],

    employment_types: [
        "Government", "Private", "Self-Employed", "Business Owner",
        "Student", "Unemployed", "Freelancer", "Retired"
    ],


    has_children: ["No Children", "Has Children", "No Preference"],

    practice_levels: [
        "Very Religious", "Moderately Religious", "Somewhat Religious", "Not Religious"
    ],

    willing_to_relocate: ["Yes", "No", "Maybe"],


}


// ─────────────────────────────────────────────────────────────────────────────
// SALARY RANGES BY CURRENCY
// Usage: SALARY_BY_CURRENCY[country.currencies[0]]
// ─────────────────────────────────────────────────────────────────────────────
const SALARY_BY_CURRENCY = {
    // ── Pakistan ──────────────────────────────────────────────────────────────
    PKR: [
        "No preference",
        "Less than PKR 50,000",
        "PKR 50,000 – PKR 100,000",
        "PKR 100,000 – PKR 200,000",
        "PKR 200,000 – PKR 600,000",
        "PKR 600,000 – PKR 1,000,000",
        "PKR 1,000,000+",
    ],
    // ── UAE ───────────────────────────────────────────────────────────────────
    AED: [
        "No preference",
        "Less than AED 2,000",
        "AED 2,000 – AED 5,000",
        "AED 5,000 – AED 10,000",
        "AED 10,000 – AED 20,000",
        "AED 20,000 – AED 50,000",
        "AED 50,000+",
    ],
    // ── Saudi Arabia ──────────────────────────────────────────────────────────
    SAR: [
        "No preference",
        "Less than SAR 3,000",
        "SAR 3,000 – SAR 6,000",
        "SAR 6,000 – SAR 12,000",
        "SAR 12,000 – SAR 25,000",
        "SAR 25,000 – SAR 50,000",
        "SAR 50,000+",
    ],
    // ── Qatar ─────────────────────────────────────────────────────────────────
    QAR: [
        "No preference",
        "Less than QAR 3,000",
        "QAR 3,000 – QAR 6,000",
        "QAR 6,000 – QAR 12,000",
        "QAR 12,000 – QAR 25,000",
        "QAR 25,000 – QAR 50,000",
        "QAR 50,000+",
    ],
    // ── Bahrain ───────────────────────────────────────────────────────────────
    BHD: [
        "No preference",
        "Less than BHD 300",
        "BHD 300 – BHD 700",
        "BHD 700 – BHD 1,500",
        "BHD 1,500 – BHD 3,000",
        "BHD 3,000 – BHD 6,000",
        "BHD 6,000+",
    ],
    // ── Kuwait ────────────────────────────────────────────────────────────────
    KWD: [
        "No preference",
        "Less than KWD 200",
        "KWD 200 – KWD 500",
        "KWD 500 – KWD 1,000",
        "KWD 1,000 – KWD 2,000",
        "KWD 2,000 – KWD 5,000",
        "KWD 5,000+",
    ],
    // ── Oman ──────────────────────────────────────────────────────────────────
    OMR: [
        "No preference",
        "Less than OMR 300",
        "OMR 300 – OMR 700",
        "OMR 700 – OMR 1,500",
        "OMR 1,500 – OMR 3,000",
        "OMR 3,000 – OMR 6,000",
        "OMR 6,000+",
    ],
    // ── USA ───────────────────────────────────────────────────────────────────
    USD: [
        "No preference",
        "Less than $2,000",
        "$2,000 – $5,000",
        "$5,000 – $10,000",
        "$10,000 – $20,000",
        "$20,000 – $50,000",
        "$50,000+",
    ],
    // ── UK ────────────────────────────────────────────────────────────────────
    GBP: [
        "No preference",
        "Less than £2,000",
        "£2,000 – £4,000",
        "£4,000 – £8,000",
        "£8,000 – £15,000",
        "£15,000 – £30,000",
        "£30,000+",
    ],
    // ── Canada ────────────────────────────────────────────────────────────────
    CAD: [
        "No preference",
        "Less than CAD 2,000",
        "CAD 2,000 – CAD 4,000",
        "CAD 4,000 – CAD 7,000",
        "CAD 7,000 – CAD 12,000",
        "CAD 12,000 – CAD 25,000",
        "CAD 25,000+",
    ],
    // ── Australia ─────────────────────────────────────────────────────────────
    AUD: [
        "No preference",
        "Less than AUD 3,000",
        "AUD 3,000 – AUD 5,000",
        "AUD 5,000 – AUD 8,000",
        "AUD 8,000 – AUD 15,000",
        "AUD 15,000 – AUD 30,000",
        "AUD 30,000+",
    ],
    // ── Eurozone  (Germany, France, Netherlands, Belgium, Spain, Italy,
    //               Greece, Austria, Finland, Portugal, Ireland) ──────────────
    EUR: [
        "No preference",
        "Less than €1,500",
        "€1,500 – €3,000",
        "€3,000 – €5,000",
        "€5,000 – €8,000",
        "€8,000 – €15,000",
        "€15,000+",
    ],
    // ── Norway ────────────────────────────────────────────────────────────────
    NOK: [
        "No preference",
        "Less than NOK 20,000",
        "NOK 20,000 – NOK 40,000",
        "NOK 40,000 – NOK 70,000",
        "NOK 70,000 – NOK 120,000",
        "NOK 120,000 – NOK 200,000",
        "NOK 200,000+",
    ],
    // ── Sweden ────────────────────────────────────────────────────────────────
    SEK: [
        "No preference",
        "Less than SEK 20,000",
        "SEK 20,000 – SEK 35,000",
        "SEK 35,000 – SEK 60,000",
        "SEK 60,000 – SEK 100,000",
        "SEK 100,000 – SEK 200,000",
        "SEK 200,000+",
    ],
    // ── Denmark ───────────────────────────────────────────────────────────────
    DKK: [
        "No preference",
        "Less than DKK 15,000",
        "DKK 15,000 – DKK 30,000",
        "DKK 30,000 – DKK 50,000",
        "DKK 50,000 – DKK 80,000",
        "DKK 80,000 – DKK 150,000",
        "DKK 150,000+",
    ],
    // ── Switzerland ───────────────────────────────────────────────────────────
    CHF: [
        "No preference",
        "Less than CHF 3,000",
        "CHF 3,000 – CHF 5,000",
        "CHF 5,000 – CHF 8,000",
        "CHF 8,000 – CHF 12,000",
        "CHF 12,000 – CHF 20,000",
        "CHF 20,000+",
    ],
    // ── Turkey ────────────────────────────────────────────────────────────────
    TRY: [
        "No preference",
        "Less than TRY 10,000",
        "TRY 10,000 – TRY 25,000",
        "TRY 25,000 – TRY 50,000",
        "TRY 50,000 – TRY 100,000",
        "TRY 100,000 – TRY 250,000",
        "TRY 250,000+",
    ],
    // ── Malaysia ──────────────────────────────────────────────────────────────
    MYR: [
        "No preference",
        "Less than MYR 2,000",
        "MYR 2,000 – MYR 4,000",
        "MYR 4,000 – MYR 8,000",
        "MYR 8,000 – MYR 15,000",
        "MYR 15,000 – MYR 30,000",
        "MYR 30,000+",
    ],
    // ── New Zealand ───────────────────────────────────────────────────────────
    NZD: [
        "No preference",
        "Less than NZD 2,500",
        "NZD 2,500 – NZD 5,000",
        "NZD 5,000 – NZD 8,000",
        "NZD 8,000 – NZD 15,000",
        "NZD 15,000 – NZD 30,000",
        "NZD 30,000+",
    ],
};

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY OPTIONS  (29 countries)
// Each entry: flag · currencies · nationalities · cities · mother_tongues
// Salary ranges  →  SALARY_BY_CURRENCY[country.currencies[0]]
// ─────────────────────────────────────────────────────────────────────────────
const COUNTRY_OPTIONS = {

    // ── 1. Pakistan ───────────────────────────────────────────────────────────
    Pakistan: {
        flag: "🇵🇰",
        currencies: ["PKR"],
        nationalities: ["Pakistani"],
        cities: [
            // Punjab
            "Islamabad", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala",
            "Multan", "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura",
            "Jhang", "Rahim Yar Khan", "Gujrat", "Kasur", "Okara",
            "Chiniot", "Kamoke", "Hafizabad", "Khanewal", "Sahiwal",
            "Vehari", "Pakpattan", "Mandi Bahauddin", "Narowal", "Attock",
            "Chakwal", "Jhelum", "Muzaffargarh", "Lodhran", "Layyah",
            "Bhakkar", "Mianwali", "Khushab", "Toba Tek Singh", "Nankana Sahib",
            "Shorkot", "Wazirabad", "Daska", "Sambrial", "Pasrur",
            "Kot Addu", "Ahmadpur East", "Burewala", "Mailsi",
            "Jaranwala", "Tandlianwala", "Chichawatni", "Arifwala",
            "Renala Khurd", "Pattoki", "Chunian", "Phool Nagar",
            "Kamalia", "Gojra", "Samundri", "Dijkot", "Chak Jhumra", "Lalian",
            // Sindh
            "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah",
            "Mirpurkhas", "Jacobabad", "Shikarpur", "Khairpur", "Dadu",
            "Badin", "Thatta", "Sanghar", "Umerkot", "Tharparkar",
            "Matiari", "Qambar Shahdadkot", "Kashmore", "Ghotki",
            "Kandhkot", "Mehar", "Sehwan", "Hala", "Moro",
            "Naushahro Feroze", "Sakrand", "Gambat", "Kotri", "Jamshoro",
            "Ratodero", "Dokri", "Kambar", "Tando Adam", "Tando Allahyar",
            "Tando Muhammad Khan", "Mirpur Mathelo", "Rohri",
            // KPK
            "Peshawar", "Mardan", "Mingora", "Kohat", "Abbottabad",
            "Mansehra", "Dera Ismail Khan", "Swabi", "Nowshera",
            "Charsadda", "Bannu", "Haripur", "Karak", "Hangu",
            "Chitral", "Dir Upper", "Dir Lower", "Swat", "Buner",
            "Shangla", "Batagram", "Tank", "Lakki Marwat", "Malakand",
            "Timergara", "Chakdara", "Saidu Sharif",
            // Balochistan
            "Quetta", "Turbat", "Khuzdar", "Chaman", "Gwadar",
            "Hub", "Dera Murad Jamali", "Nushki", "Dalbandin",
            "Kharan", "Ziarat", "Loralai", "Sibi", "Mastung",
            "Pishin", "Qila Saifullah", "Muslimbagh", "Qila Abdullah",
            "Zhob", "Kuchlak", "Uthal", "Bela", "Usta Muhammad",
            "Jaffarabad", "Nasirabad",
            // AJK
            "Muzaffarabad", "Mirpur", "Rawalakot", "Kotli",
            "Bhimber", "Bagh", "Haveli", "Sudhnuti", "Neelum",
            // Gilgit-Baltistan
            "Gilgit", "Skardu", "Chilas", "Hunza", "Nagar",
            "Ghanche", "Shigar", "Ghizer", "Diamer", "Astore",
            "Other"
        ],
        mother_tongues: [
            "Urdu", "Punjabi", "Pashto", "Sindhi", "Balochi", "Saraiki",
            "Hindko", "Kashmiri", "Brahui", "Shina", "Burushaski", "Khowar",
            "Wakhi", "Balti", "Torwali", "Other"
        ],
    },

    // ── 2. UAE ────────────────────────────────────────────────────────────────
    UAE: {
        flag: "🇦🇪",
        currencies: ["AED"],
        nationalities: ["Emirati", "Pakistani", "Indian", "Other"],
        cities: [
            // Dubai
            "Dubai", "Deira", "Bur Dubai", "Jumeirah", "Dubai Marina",
            "Downtown Dubai", "Business Bay", "Dubai Silicon Oasis",
            "Dubai Investment Park", "Jebel Ali", "Al Quoz", "Al Nahda (Dubai)",
            "Mirdif", "Al Barsha", "Dubai Sports City", "International City",
            "Discovery Gardens", "The Palm Jumeirah", "Dubai Creek",
            "Oud Metha", "Muhaisnah", "Al Qusais", "Al Twar", "Rashidiya",
            // Abu Dhabi
            "Abu Dhabi", "Al Ain", "Mussafah", "Khalifa City",
            "Mohammed Bin Zayed City", "Al Reem Island", "Yas Island",
            "Saadiyat Island", "Al Shamkha", "Baniyas", "Al Bahia",
            "Al Rahba", "Al Wathba", "Al Falah", "Zayed City",
            // Sharjah
            "Sharjah", "Al Majaz", "Al Nahda (Sharjah)", "Al Qasimia",
            "Al Taawun", "Muwailih", "Industrial Area (Sharjah)", "Al Khan",
            // Other Emirates
            "Ajman", "Al Jurf", "Al Rashidiya (Ajman)", "Emirates City",
            "Ras Al Khaimah", "Al Nakheel", "Al Hamra Village", "Khuzam",
            "Fujairah", "Dibba Al Fujairah", "Khor Fakkan", "Kalba",
            "Umm Al Quwain",
            "Other"
        ],
        mother_tongues: [
            "Arabic", "English", "Hindi", "Urdu", "Malayalam",
            "Tagalog", "Bengali", "Punjabi", "Tamil", "Pashto",
            "Persian (Farsi)", "Balochi", "Sindhi", "Other"
        ],
    },

    // ── 3. Saudi Arabia ───────────────────────────────────────────────────────
    "Saudi Arabia": {
        flag: "🇸🇦",
        currencies: ["SAR"],
        nationalities: ["Saudi", "Pakistani", "Indian", "Other"],
        cities: [
            "Riyadh", "Al Kharj", "Dawadmi", "Diriyah", "Al Majmaah",
            "Shaqra", "Al Quwayiyah", "Afif", "Zulfi", "Huraymila",
            "Jeddah", "Mecca", "Taif", "Rabigh", "Al Qunfudhah",
            "Al Lith", "Al Jumum", "Khulais",
            "Medina", "Yanbu", "Al Ula", "Badr", "Mahd adh Dhahab",
            "Dammam", "Khobar", "Al Jubail", "Al Qatif", "Hafr Al Batin",
            "Ras Tanura", "Safwa", "Abqaiq",
            "Abha", "Khamis Mushait", "Bisha", "Sarat Abidah", "Muhayil",
            "Tabuk", "Al Wajh", "Umluj", "Haql",
            "Hail", "Baqaa",
            "Arar", "Rafha", "Turaif",
            "Najran", "Sharurah",
            "Al Bahah", "Baljurashi",
            "Jizan", "Abu Arish", "Sabya", "Samtah",
            "Sakaka", "Dumat Al Jandal",
            "Buraidah", "Unaizah", "Al Rass",
            "Other"
        ],
        mother_tongues: [
            "Arabic", "English", "Urdu", "Hindi", "Tagalog",
            "Bengali", "Malayalam", "Punjabi", "Tamil", "Other"
        ],
    },

    // ── 4. Qatar ──────────────────────────────────────────────────────────────
    Qatar: {
        flag: "🇶🇦",
        currencies: ["QAR"],
        nationalities: ["Qatari", "Pakistani", "Indian", "Other"],
        cities: [
            "Doha", "Al Rayyan", "Umm Salal", "Al Wakrah", "Al Khor",
            "Al Daayen", "Al Shamal", "Al Sheehaniya", "Mesaieed",
            "Lusail", "West Bay", "The Pearl", "Education City",
            "Msheireb", "Old Airport Area", "Industrial Area (Qatar)",
            "Al Aziziya", "Gharrafa", "Al Sadd", "Ain Khaled",
            "Abu Hamour", "Al Muntazah", "Madinat Khalifa", "Nuaija", "Wakair",
            "Other"
        ],
        mother_tongues: [
            "Arabic", "English", "Urdu", "Hindi", "Malayalam",
            "Tagalog", "Bengali", "Nepali", "Tamil", "Other"
        ],
    },

    // ── 5. Bahrain ────────────────────────────────────────────────────────────
    Bahrain: {
        flag: "🇧🇭",
        currencies: ["BHD"],
        nationalities: ["Bahraini", "Pakistani", "Indian", "Other"],
        cities: [
            "Manama", "Riffa", "Muharraq", "Hamad Town", "Isa Town",
            "Sitra", "Jidhafs", "Al Budaiya", "Zallaq", "Al Hidd",
            "Sanabis", "Adliya", "Seef", "Salmanabad", "Tubli",
            "Eker", "Askar", "Jaw", "Malkiya", "Karranah",
            "Diraz", "Al Janabiyah", "Bani Jamra", "Karzakan",
            "Durrat Al Bahrain", "Amwaj Islands", "Mahooz",
            "Al Qudaibiya", "Ghudaibiya", "Um Al Hassam",
            "Other"
        ],
        mother_tongues: [
            "Arabic", "English", "Urdu", "Hindi", "Malayalam",
            "Tagalog", "Persian (Farsi)", "Other"
        ],
    },

    // ── 6. Kuwait ─────────────────────────────────────────────────────────────
    Kuwait: {
        flag: "🇰🇼",
        currencies: ["KWD"],
        nationalities: ["Kuwaiti", "Pakistani", "Indian", "Other"],
        cities: [
            "Kuwait City", "Hawalli", "Salmiya", "Farwaniya", "Jahra",
            "Ahmadi", "Mangaf", "Fahaheel", "Sabah Al Salem", "Fintas",
            "Rumaithiya", "Bayan", "Mishref", "Salwa", "Riqqa",
            "Abu Halifa", "Hadiya", "Mahboula", "Egaila", "Abu Fatira",
            "Al Rai", "Ardiya", "Shuwaikh", "Sulaibiya", "Jabriya",
            "Hittin", "Qortuba", "Nuzha", "Surra", "Abdullah Al Salem",
            "Dasma", "Shamiya", "Kaifan", "Khaldiya", "Faiha",
            "Shuwaikh Industrial", "Sabhan", "Qurain",
            "Abu Hasaniya", "Mubarak Al Kabeer",
            "Other"
        ],
        mother_tongues: [
            "Arabic", "English", "Urdu", "Hindi", "Malayalam",
            "Tagalog", "Bengali", "Tamil", "Other"
        ],
    },

    // ── 7. Oman ───────────────────────────────────────────────────────────────
    Oman: {
        flag: "🇴🇲",
        currencies: ["OMR"],
        nationalities: ["Omani", "Pakistani", "Indian", "Other"],
        cities: [
            "Muscat", "Muttrah", "Ruwi", "Qurum", "Madinat Al Sultan Qaboos",
            "Al Khuwair", "Al Azaiba", "Ghubrah", "Bausher", "Seeb",
            "Amerat", "Quriyat",
            "Salalah", "Thumrait", "Mirbat", "Taqa", "Sadah",
            "Sohar", "Barka", "Al Khaburah", "Saham", "Liwa",
            "Rustaq", "Al Awabi", "Nakhal",
            "Nizwa", "Bahla", "Manah", "Adam", "Izki", "Bidbid",
            "Sur", "Ibra", "Al Mudhaibi",
            "Ibri", "Yanqul", "Dhank",
            "Al Buraimi", "Mahdah",
            "Haima", "Duqm",
            "Khasab", "Bukha",
            "Other"
        ],
        mother_tongues: [
            "Arabic", "Balochi", "Swahili", "Urdu", "Hindi",
            "English", "Malayalam", "Tagalog", "Other"
        ],
    },

    // ── 8. USA ────────────────────────────────────────────────────────────────
    USA: {
        flag: "🇺🇸",
        currencies: ["USD"],
        nationalities: ["American", "Pakistani-American", "Other"],
        cities: [
            // New York
            "New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany",
            // California
            "Los Angeles", "San Diego", "San Jose", "San Francisco",
            "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield",
            "Anaheim", "Santa Ana", "Riverside", "Stockton", "Irvine",
            "Fremont", "San Bernardino", "Modesto", "Fontana", "Moreno Valley",
            "Glendale", "Santa Clarita", "Garden Grove", "Oceanside",
            "Huntington Beach", "Rancho Cucamonga",
            // Texas
            "Houston", "San Antonio", "Dallas", "Austin", "Fort Worth",
            "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo",
            "Lubbock", "Garland", "Irving", "Amarillo", "Grand Prairie",
            "McKinney", "Frisco", "Pasadena", "Killeen", "Mesquite",
            // Florida
            "Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg",
            "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie",
            "Pembroke Pines", "Hollywood", "Gainesville", "Miramar",
            "Coral Springs", "Clearwater",
            // Illinois
            "Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield",
            // Pennsylvania
            "Philadelphia", "Pittsburgh", "Allentown", "Erie",
            // Ohio
            "Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton",
            // Georgia
            "Atlanta", "Augusta", "Savannah",
            // North Carolina
            "Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem",
            // Michigan
            "Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing",
            // Arizona
            "Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale",
            "Gilbert", "Tempe", "Peoria (AZ)",
            // Washington
            "Seattle", "Spokane", "Tacoma", "Vancouver (WA)", "Bellevue",
            // Tennessee
            "Nashville", "Memphis", "Knoxville", "Chattanooga",
            // Indiana
            "Indianapolis", "Fort Wayne",
            // Massachusetts
            "Boston", "Worcester",
            // Colorado
            "Denver", "Colorado Springs", "Aurora (CO)", "Fort Collins",
            // Nevada
            "Las Vegas", "Henderson", "Reno",
            // Oregon
            "Portland", "Salem", "Eugene",
            // Virginia
            "Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Arlington (VA)",
            // Maryland
            "Baltimore",
            // Wisconsin
            "Milwaukee", "Madison",
            // Minnesota
            "Minneapolis", "Saint Paul",
            // Missouri
            "Kansas City", "Saint Louis",
            // Oklahoma
            "Oklahoma City", "Tulsa",
            // Louisiana
            "New Orleans", "Baton Rouge",
            // Kentucky
            "Louisville", "Lexington",
            // Alabama
            "Birmingham", "Montgomery",
            // New Mexico
            "Albuquerque", "Santa Fe",
            // Hawaii
            "Honolulu",
            // Washington DC
            "Washington DC",
            // Connecticut
            "Bridgeport", "New Haven", "Hartford",
            // Utah
            "Salt Lake City",
            // New Jersey
            "Newark", "Jersey City", "Paterson",
            "Other"
        ],
        mother_tongues: [
            "English", "Spanish", "Urdu", "Punjabi", "Hindi",
            "Arabic", "French", "Mandarin", "Tagalog", "Vietnamese",
            "Korean", "Persian (Farsi)", "Pashto", "Other"
        ],
    },

    // ── 9. UK ─────────────────────────────────────────────────────────────────
    UK: {
        flag: "🇬🇧",
        currencies: ["GBP"],
        nationalities: ["British", "British-Pakistani", "Other"],
        cities: [
            // London
            "London", "Westminster", "Southwark", "Tower Hamlets", "Newham",
            "Hackney", "Islington", "Camden", "Lambeth", "Lewisham",
            "Haringey", "Ealing", "Hounslow", "Brent", "Waltham Forest",
            "Redbridge", "Barking and Dagenham", "Enfield", "Croydon",
            // England
            "Birmingham", "Manchester", "Leeds", "Sheffield", "Liverpool",
            "Bristol", "Coventry", "Leicester", "Bradford", "Nottingham",
            "Kingston upon Hull", "Stoke-on-Trent", "Wolverhampton",
            "Derby", "Southampton", "Portsmouth", "Plymouth", "Reading",
            "Milton Keynes", "Northampton", "Luton", "Sunderland",
            "Middlesbrough", "Preston", "Blackburn", "Burnley", "Bolton",
            "Rochdale", "Oldham", "Stockport", "Salford", "Wigan",
            "Warrington", "Huddersfield", "Halifax", "Wakefield",
            "Rotherham", "Doncaster", "Barnsley", "Grimsby",
            "Ipswich", "Norwich", "Peterborough", "Cambridge",
            "Oxford", "Slough", "Watford", "Chelmsford", "Colchester",
            "Southend-on-Sea", "Brighton", "Crawley", "Worthing", "Eastbourne",
            "Bournemouth", "Poole", "Exeter", "Gloucester",
            "Swindon", "Bath", "Cheltenham", "Worcester",
            "Hereford", "Shrewsbury", "Telford",
            "Newcastle upon Tyne", "Gateshead", "Durham", "Darlington",
            "Carlisle", "Lancaster", "Blackpool",
            // Scotland
            "Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness",
            "Stirling", "Perth", "Livingston", "Kilmarnock",
            // Wales
            "Cardiff", "Swansea", "Newport", "Wrexham",
            // Northern Ireland
            "Belfast", "Derry", "Lisburn", "Newry",
            "Other"
        ],
        mother_tongues: [
            "English", "Urdu", "Punjabi", "Mirpuri", "Pashto",
            "Bengali", "Arabic", "Welsh", "Scottish Gaelic", "Other"
        ],
    },

    // ── 10. Canada ────────────────────────────────────────────────────────────
    Canada: {
        flag: "🇨🇦",
        currencies: ["CAD"],
        nationalities: ["Canadian", "Pakistani-Canadian", "Other"],
        cities: [
            // Ontario
            "Toronto", "Mississauga", "Brampton", "Scarborough", "North York",
            "Etobicoke", "Vaughan", "Markham", "Richmond Hill", "Oakville",
            "Burlington", "Hamilton", "Kitchener", "Waterloo", "Cambridge",
            "Guelph", "London", "Windsor", "Oshawa", "Barrie",
            "Kingston", "Sudbury", "Thunder Bay", "Peterborough", "St. Catharines",
            "Niagara Falls", "Brantford", "Sarnia", "Sault Ste. Marie",
            "Ottawa",
            // Quebec
            "Montreal", "Laval", "Longueuil", "Québec City", "Gatineau",
            "Sherbrooke", "Saguenay", "Lévis", "Trois-Rivières", "Terrebonne",
            // British Columbia
            "Vancouver", "Surrey", "Burnaby", "Richmond", "Abbotsford",
            "Kelowna", "Victoria", "Langley", "Coquitlam", "Delta",
            "North Vancouver", "Kamloops", "Prince George", "Chilliwack",
            // Alberta
            "Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert",
            "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove",
            // Saskatchewan
            "Saskatoon", "Regina", "Moose Jaw", "Prince Albert",
            // Manitoba
            "Winnipeg", "Brandon",
            // Nova Scotia
            "Halifax", "Dartmouth", "Sydney (NS)",
            // New Brunswick
            "Fredericton", "Moncton", "Saint John",
            // Newfoundland
            "St. John's",
            // PEI
            "Charlottetown",
            "Other"
        ],
        mother_tongues: [
            "English", "French", "Punjabi", "Urdu", "Mandarin",
            "Cantonese", "Arabic", "Pashto", "Hindi", "Tagalog", "Other"
        ],
    },

    // ── 11. Australia ─────────────────────────────────────────────────────────
    Australia: {
        flag: "🇦🇺",
        currencies: ["AUD"],
        nationalities: ["Australian", "Pakistani-Australian", "Other"],
        cities: [
            // New South Wales
            "Sydney", "Parramatta", "Liverpool", "Blacktown", "Penrith",
            "Campbelltown", "Bankstown", "Auburn", "Fairfield", "Cabramatta",
            "Hurstville", "Hornsby", "Chatswood", "Manly", "Bondi",
            "Newcastle", "Wollongong", "Maitland", "Bathurst", "Orange",
            "Albury", "Wagga Wagga", "Tamworth", "Dubbo", "Coffs Harbour",
            // Victoria
            "Melbourne", "Dandenong", "Frankston", "Footscray", "Sunshine",
            "Werribee", "Geelong", "Ballarat", "Bendigo", "Craigieburn",
            "Tarneit", "Point Cook", "Hoppers Crossing", "Ringwood", "Knox",
            "Shepparton", "Wodonga", "Warrnambool",
            // Queensland
            "Brisbane", "Gold Coast", "Sunshine Coast", "Toowoomba", "Ipswich",
            "Rockhampton", "Townsville", "Cairns", "Logan", "Redland",
            "Moreton Bay", "Mackay", "Hervey Bay", "Bundaberg", "Mount Isa",
            // South Australia
            "Adelaide", "Salisbury", "Playford", "Marion", "Onkaparinga",
            "Mount Gambier", "Whyalla", "Murray Bridge",
            // Western Australia
            "Perth", "Fremantle", "Rockingham", "Mandurah", "Joondalup",
            "Stirling", "Wanneroo", "Swan", "Armadale", "Gosnells",
            "Bunbury", "Geraldton", "Kalgoorlie", "Albany",
            // ACT
            "Canberra", "Queanbeyan",
            // Northern Territory
            "Darwin", "Palmerston", "Alice Springs",
            // Tasmania
            "Hobart", "Launceston", "Devonport", "Burnie",
            "Other"
        ],
        mother_tongues: [
            "English", "Urdu", "Punjabi", "Pashto", "Arabic",
            "Mandarin", "Hindi", "Tamil", "Tagalog", "Vietnamese", "Other"
        ],
    },

    // ── 12. Germany ───────────────────────────────────────────────────────────
    Germany: {
        flag: "🇩🇪",
        currencies: ["EUR"],
        nationalities: ["German", "Pakistani-German", "Other"],
        cities: [
            "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt",
            "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig",
            "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg",
            "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster",
            "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden", "Gelsenkirchen",
            "Mönchengladbach", "Braunschweig", "Chemnitz", "Kiel", "Aachen",
            "Halle", "Magdeburg", "Freiburg", "Krefeld", "Lübeck",
            "Oberhausen", "Erfurt", "Mainz", "Rostock", "Kassel",
            "Hagen", "Hamm", "Saarbrücken", "Mülheim", "Potsdam",
            "Ludwigshafen", "Oldenburg", "Leverkusen", "Osnabrück", "Solingen",
            "Heidelberg", "Darmstadt", "Paderborn", "Regensburg", "Ingolstadt",
            "Würzburg", "Ulm", "Wolfsburg", "Göttingen", "Recklinghausen",
            "Bottrop", "Heilbronn", "Pforzheim", "Offenbach", "Bremerhaven",
            "Fürth", "Remscheid", "Reutlingen", "Koblenz", "Erlangen",
            "Moers", "Siegen", "Hildesheim", "Trier", "Jena",
            "Cottbus", "Gera", "Zwickau", "Schwerin", "Kempten",
            "Neuss", "Bergisch Gladbach", "Mülheim an der Ruhr",
            "Other"
        ],
        mother_tongues: [
            "German", "Urdu", "Punjabi", "Pashto", "Arabic",
            "Turkish", "Kurdish", "Persian (Farsi)", "Other"
        ],
    },

    // ── 13. France ────────────────────────────────────────────────────────────
    France: {
        flag: "🇫🇷",
        currencies: ["EUR"],
        nationalities: ["French", "Pakistani-French", "Other"],
        cities: [
            "Paris", "Marseille", "Lyon", "Toulouse", "Nice",
            "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille",
            "Rennes", "Reims", "Le Havre", "Saint-Étienne", "Toulon",
            "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne",
            "Clermont-Ferrand", "Saint-Denis", "Le Mans", "Aix-en-Provence",
            "Brest", "Amiens", "Tours", "Limoges", "Metz", "Besançon",
            "Perpignan", "Orléans", "Mulhouse", "Rouen", "Caen",
            "Argenteuil", "Montreuil", "Roubaix", "Nancy", "Avignon",
            "Dunkirk", "Versailles", "Nanterre", "Créteil", "Poitiers",
            "Asnieres-sur-Seine", "Courbevoie", "Vitry-sur-Seine",
            "Colombes", "Aulnay-sous-Bois", "Saint-Pierre",
            "Pau", "Bayonne", "Boulogne-Billancourt", "Saint-Maur-des-Fossés",
            "Champigny-sur-Marne", "Calais", "Mérignac", "Pessac",
            "Cannes", "Antibes", "Ajaccio", "Lorient", "Quimper",
            "Other"
        ],
        mother_tongues: [
            "French", "Arabic", "Urdu", "Punjabi", "Pashto",
            "Berber (Tamazight)", "Turkish", "Other"
        ],
    },

    // ── 14. Netherlands ───────────────────────────────────────────────────────
    Netherlands: {
        flag: "🇳🇱",
        currencies: ["EUR"],
        nationalities: ["Dutch", "Pakistani-Dutch", "Other"],
        cities: [
            "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven",
            "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen",
            "Enschede", "Haarlem", "Arnhem", "Zaanstad", "Amersfoort",
            "Apeldoorn", "Maastricht", "Dordrecht", "Leiden", "Zoetermeer",
            "Zwolle", "Deventer", "Delft", "Alkmaar", "Leeuwarden",
            "Westland", "Emmen", "Venlo", "Nieuwegein", "Sittard",
            "Helmond", "Hilversum", "Oss", "Roosendaal", "Spijkenisse",
            "Schiedam", "Purmerend", "Lelystad", "Heerlen", "Ede",
            "Gouda", "Hoorn", "Vlaardingen", "Alphen aan den Rijn",
            "Zaandam", "Capelle aan den IJssel",
            "Other"
        ],
        mother_tongues: [
            "Dutch", "Urdu", "Punjabi", "Pashto", "Arabic",
            "Turkish", "Berber (Tamazight)", "English", "Other"
        ],
    },

    // ── 15. Norway ────────────────────────────────────────────────────────────
    Norway: {
        flag: "🇳🇴",
        currencies: ["NOK"],
        nationalities: ["Norwegian", "Pakistani-Norwegian", "Other"],
        cities: [
            "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen",
            "Fredrikstad", "Kristiansand", "Sandnes", "Tromsø", "Sarpsborg",
            "Skien", "Ålesund", "Sandefjord", "Haugesund", "Tønsberg",
            "Moss", "Porsgrunn", "Bodø", "Arendal", "Hamar",
            "Larvik", "Halden", "Lillehammer", "Molde", "Horten",
            "Gjøvik", "Harstad", "Askøy", "Jessheim", "Kongsberg",
            "Ski", "Ås", "Bærum", "Lørenskog", "Nittedal",
            "Other"
        ],
        mother_tongues: [
            "Norwegian", "Urdu", "Punjabi", "Pashto", "Arabic",
            "Somali", "Polish", "Sami", "Other"
        ],
    },

    // ── 16. Sweden ────────────────────────────────────────────────────────────
    Sweden: {
        flag: "🇸🇪",
        currencies: ["SEK"],
        nationalities: ["Swedish", "Pakistani-Swedish", "Other"],
        cities: [
            "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås",
            "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping",
            "Lund", "Umeå", "Gävle", "Borås", "Södertälje",
            "Eskilstuna", "Halmstad", "Växjö", "Karlstad", "Sundsvall",
            "Östersund", "Trollhättan", "Luleå", "Borlänge", "Kristianstad",
            "Kalmar", "Falun", "Skövde", "Karlskrona", "Uddevalla",
            "Huddinge", "Täby", "Nacka", "Sollentuna", "Upplands Väsby",
            "Haninge", "Järfälla", "Botkyrka", "Tyresö", "Lidingö",
            "Sigtuna", "Norrtälje", "Nyköping", "Motala", "Varberg",
            "Landskrona", "Trelleborg", "Ystad", "Ängelholm", "Piteå",
            "Other"
        ],
        mother_tongues: [
            "Swedish", "Urdu", "Punjabi", "Pashto", "Arabic",
            "Somali", "Kurdish", "Persian (Farsi)", "Finnish", "Other"
        ],
    },

    // ── 17. Denmark ───────────────────────────────────────────────────────────
    Denmark: {
        flag: "🇩🇰",
        currencies: ["DKK"],
        nationalities: ["Danish", "Pakistani-Danish", "Other"],
        cities: [
            "Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg",
            "Randers", "Kolding", "Horsens", "Vejle", "Roskilde",
            "Herning", "Silkeborg", "Næstved", "Fredericia", "Viborg",
            "Køge", "Holstebro", "Taastrup", "Slagelse", "Hillerød",
            "Helsingør", "Ballerup", "Gladsaxe", "Hvidovre", "Albertslund",
            "Frederiksberg", "Lyngby", "Greve", "Farum", "Birkerød",
            "Sønderborg", "Holbæk", "Svendborg", "Hjørring", "Frederikshavn",
            "Ringsted", "Nykøbing Falster", "Kalundborg", "Vordingborg",
            "Ikast", "Skive", "Thisted", "Struer",
            "Other"
        ],
        mother_tongues: [
            "Danish", "Urdu", "Punjabi", "Pashto", "Arabic",
            "Turkish", "Somali", "Polish", "Other"
        ],
    },

    // ── 18. Belgium ───────────────────────────────────────────────────────────
    Belgium: {
        flag: "🇧🇪",
        currencies: ["EUR"],
        nationalities: ["Belgian", "Pakistani-Belgian", "Other"],
        cities: [
            "Brussels", "Antwerp", "Ghent", "Charleroi", "Liège",
            "Bruges", "Namur", "Leuven", "Mons", "Aalst",
            "Mechelen", "La Louvière", "Kortrijk", "Hasselt", "Ostend",
            "Sint-Niklaas", "Tournai", "Genk", "Seraing", "Roeselare",
            "Mouscron", "Verviers", "Beveren", "Dendermonde", "Beringen",
            "Turnhout", "Dilbeek", "Sint-Truiden", "Lommel", "Heist-op-den-Berg",
            "Geel", "Lokeren", "Brasschaat", "Maasmechelen", "Herstal",
            "Anderlecht", "Schaerbeek", "Molenbeek", "Ixelles", "Etterbeek",
            "Uccle", "Jette", "Laeken", "Forest", "Saint-Gilles",
            "Arlon", "Marche-en-Famenne", "Libramont", "Eupen",
            "Other"
        ],
        mother_tongues: [
            "Dutch (Flemish)", "French", "Urdu", "Punjabi", "Pashto",
            "Arabic", "Turkish", "German", "Other"
        ],
    },

    // ── 19. Switzerland ───────────────────────────────────────────────────────
    Switzerland: {
        flag: "🇨🇭",
        currencies: ["CHF"],
        nationalities: ["Swiss", "Pakistani-Swiss", "Other"],
        cities: [
            "Zurich", "Geneva", "Basel", "Bern", "Lausanne",
            "Winterthur", "Lucerne", "St. Gallen", "Lugano", "Biel/Bienne",
            "Thun", "Köniz", "La Chaux-de-Fonds", "Fribourg", "Schaffhausen",
            "Chur", "Vernier", "Neuchâtel", "Uster", "Sion",
            "Emmen", "Lancy", "Renens", "Yverdon-les-Bains", "Zug",
            "Baar", "Arlesheim", "Arbon", "Küsnacht", "Reinach",
            "Allschwil", "Binningen", "Muri bei Bern", "Onex", "Carouge",
            "Meyrin", "Plan-les-Ouates", "Dietikon", "Kloten", "Wettingen",
            "Baden", "Olten", "Solothurn", "Aarau", "Bellinzona",
            "Locarno", "Mendrisio", "Delémont", "Frenkendorf", "Riehen",
            "Other"
        ],
        mother_tongues: [
            "German (Swiss German)", "French", "Italian", "Urdu",
            "Punjabi", "Pashto", "Arabic", "Romansh", "Other"
        ],
    },

    // ── 20. Spain ─────────────────────────────────────────────────────────────
    Spain: {
        flag: "🇪🇸",
        currencies: ["EUR"],
        nationalities: ["Spanish", "Pakistani-Spanish", "Other"],
        cities: [
            "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza",
            "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao",
            "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón",
            "L'Hospitalet de Llobregat", "A Coruña", "Vitoria-Gasteiz",
            "Granada", "Elche", "Oviedo", "Santa Cruz de Tenerife",
            "Badalona", "Cartagena", "Terrassa", "Jerez de la Frontera",
            "Sabadell", "Móstoles", "Alcalá de Henares", "Pamplona",
            "Fuenlabrada", "Almería", "Leganés", "San Sebastián",
            "Santander", "Burgos", "Castellón de la Plana", "Albacete",
            "Getafe", "Alcorcón", "Huelva", "Badajoz", "Logroño",
            "Salamanca", "Tarragona", "Lleida", "Mataró", "Dos Hermanas",
            "Marbella", "León", "Torrejón de Ardoz", "Parla",
            "Alcobendas", "Reus", "Barakaldo", "Sant Cugat del Vallès",
            "Jaén", "Girona", "Lugo", "Ourense", "Cádiz",
            "Other"
        ],
        mother_tongues: [
            "Spanish (Castilian)", "Urdu", "Punjabi", "Pashto",
            "Arabic", "Catalan", "Galician", "Basque", "Other"
        ],
    },

    // ── 21. Italy ─────────────────────────────────────────────────────────────
    Italy: {
        flag: "🇮🇹",
        currencies: ["EUR"],
        nationalities: ["Italian", "Pakistani-Italian", "Other"],
        cities: [
            "Rome", "Milan", "Naples", "Turin", "Palermo",
            "Genoa", "Bologna", "Florence", "Bari", "Catania",
            "Venice", "Verona", "Messina", "Padua", "Trieste",
            "Brescia", "Parma", "Taranto", "Prato", "Reggio Calabria",
            "Modena", "Reggio Emilia", "Perugia", "Livorno", "Ravenna",
            "Cagliari", "Foggia", "Rimini", "Salerno", "Ferrara",
            "Sassari", "Latina", "Giugliano in Campania", "Monza", "Bergamo",
            "Syracuse", "Pescara", "Trento", "Forlì", "Vicenza",
            "Terni", "Bolzano", "Novara", "Piacenza", "Ancona",
            "Andria", "Udine", "Arezzo", "Cesena", "Lecce",
            "Pesaro", "Barletta", "Alessandria", "La Spezia", "Pisa",
            "Catanzaro", "Brindisi", "Como", "Varese", "Siracusa",
            "Marsala", "Agrigento", "Trapani", "Ragusa", "Caltanissetta",
            "Other"
        ],
        mother_tongues: [
            "Italian", "Urdu", "Punjabi", "Pashto", "Arabic",
            "Romanian", "Albanian", "Other"
        ],
    },

    // ── 22. Greece ────────────────────────────────────────────────────────────
    Greece: {
        flag: "🇬🇷",
        currencies: ["EUR"],
        nationalities: ["Greek", "Pakistani-Greek", "Other"],
        cities: [
            "Athens", "Thessaloniki", "Patras", "Piraeus", "Larissa",
            "Heraklion", "Peristeri", "Kallithea", "Acharnes", "Kalamaria",
            "Nikaia", "Glyfada", "Volos", "Ilio", "Ilioupoli",
            "Keratsini", "Evosmos", "Chalandri", "Nea Smyrni", "Marousi",
            "Agios Dimitrios", "Zografou", "Egaleo", "Agios Ioannis Rentis",
            "Rhodes", "Corfu", "Kos", "Mytilene", "Chania",
            "Ioannina", "Kavala", "Agrinio", "Haidari", "Serres",
            "Alexandroupoli", "Katerini", "Kalamata", "Trikala", "Lamia",
            "Xanthi", "Komotini", "Drama", "Kozani", "Florina",
            "Preveza", "Lefkada", "Zakynthos", "Argostoli", "Sparti",
            "Other"
        ],
        mother_tongues: [
            "Greek", "Urdu", "Punjabi", "Pashto", "Arabic",
            "Albanian", "Bulgarian", "Other"
        ],
    },

    // ── 23. Austria ───────────────────────────────────────────────────────────
    Austria: {
        flag: "🇦🇹",
        currencies: ["EUR"],
        nationalities: ["Austrian", "Pakistani-Austrian", "Other"],
        cities: [
            "Vienna", "Graz", "Linz", "Salzburg", "Innsbruck",
            "Klagenfurt", "Villach", "Wels", "Sankt Pölten", "Dornbirn",
            "Wiener Neustadt", "Steyr", "Feldkirch", "Bregenz", "Leonding",
            "Klosterneuburg", "Baden", "Wolfsberg", "Leoben", "Krems",
            "Traun", "Amstetten", "Lustenau", "Kapfenberg", "Mödling",
            "Hallein", "Kufstein", "Traiskirchen", "Schwechat", "Braunau",
            "Stockerau", "Perchtoldsdorf", "Ternitz", "Eisenstadt",
            "Bruck an der Mur", "Wörgl", "Hohenems", "Hard", "Rankweil", "Götzis",
            "Other"
        ],
        mother_tongues: [
            "German", "Urdu", "Punjabi", "Pashto", "Arabic",
            "Turkish", "Serbian", "Croatian", "Bosnian", "Other"
        ],
    },

    // ── 24. Finland ───────────────────────────────────────────────────────────
    Finland: {
        flag: "🇫🇮",
        currencies: ["EUR"],
        nationalities: ["Finnish", "Pakistani-Finnish", "Other"],
        cities: [
            "Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu",
            "Turku", "Jyväskylä", "Lahti", "Kuopio", "Kouvola",
            "Pori", "Joensuu", "Lappeenranta", "Hämeenlinna", "Vaasa",
            "Seinäjoki", "Rovaniemi", "Mikkeli", "Kotka", "Salo",
            "Porvoo", "Kokkola", "Hyvinkää", "Lohja", "Järvenpää",
            "Nurmijärvi", "Rauma", "Tuusula", "Kirkkonummi", "Kajaani",
            "Kerava", "Nokia", "Ylöjärvi", "Siilinjärvi", "Hollola",
            "Iisalmi", "Tornio", "Kemi", "Raahe", "Pietarsaari",
            "Other"
        ],
        mother_tongues: [
            "Finnish", "Swedish", "Urdu", "Punjabi", "Pashto",
            "Arabic", "Somali", "Russian", "Other"
        ],
    },

    // ── 25. Portugal ──────────────────────────────────────────────────────────
    Portugal: {
        flag: "🇵🇹",
        currencies: ["EUR"],
        nationalities: ["Portuguese", "Pakistani-Portuguese", "Other"],
        cities: [
            "Lisbon", "Porto", "Braga", "Amadora", "Setúbal",
            "Coimbra", "Queluz", "Funchal", "Almada", "Aveiro",
            "Agualva-Cacém", "Viseu", "Guimarães", "Odivelas", "Vila Nova de Gaia",
            "Évora", "Faro", "Leiria", "Loures", "Matosinhos",
            "Barreiro", "Maia", "Seixal", "Vila Nova de Famalicão",
            "Gondomar", "Póvoa de Varzim", "Barcelos", "Viana do Castelo",
            "Cascais", "Sintra", "Palmela", "Montijo", "Sesimbra",
            "Santarém", "Portimão", "Albufeira", "Tavira", "Lagos",
            "Caldas da Rainha", "Penafiel", "Paredes", "Valongo",
            "Chaves", "Bragança", "Vila Real", "Lamego", "Peso da Régua",
            "Other"
        ],
        mother_tongues: [
            "Portuguese", "Urdu", "Punjabi", "Pashto", "Arabic",
            "English", "French", "Other"
        ],
    },

    // ── 26. Ireland ───────────────────────────────────────────────────────────
    Ireland: {
        flag: "🇮🇪",
        currencies: ["EUR"],
        nationalities: ["Irish", "Pakistani-Irish", "Other"],
        cities: [
            "Dublin", "Cork", "Limerick", "Galway", "Waterford",
            "Drogheda", "Dundalk", "Swords", "Bray", "Navan",
            "Kilkenny", "Ennis", "Carlow", "Tralee", "Newbridge",
            "Portlaoise", "Mullingar", "Clonmel", "Wexford", "Balbriggan",
            "Letterkenny", "Athlone", "Tullamore", "Sligo", "Celbridge",
            "Clane", "Naas", "Tallaght", "Lucan", "Blanchardstown",
            "Santry", "Finglas", "Dún Laoghaire", "Sandyford", "Maynooth",
            "Arklow", "Wicklow", "Greystones", "Blessington", "Athy",
            "Longford", "Roscommon", "Castlebar", "Ballina", "Tuam",
            "Dungarvan", "Thurles", "Nenagh", "Cashel", "Tipperary",
            "Cobh", "Mallow", "Youghal", "Bandon", "Skibbereen",
            "Other"
        ],
        mother_tongues: [
            "English", "Irish (Gaeilge)", "Urdu", "Punjabi", "Pashto",
            "Arabic", "Polish", "Romanian", "Other"
        ],
    },

    // ── 27. Turkey ────────────────────────────────────────────────────────────
    Turkey: {
        flag: "🇹🇷",
        currencies: ["TRY"],
        nationalities: ["Turkish", "Pakistani-Turkish", "Other"],
        cities: [
            "Istanbul", "Ankara", "Izmir", "Bursa", "Adana",
            "Gaziantep", "Konya", "Antalya", "Kayseri", "Mersin",
            "Eskişehir", "Diyarbakır", "Samsun", "Denizli", "Şanlıurfa",
            "Adapazarı", "Malatya", "Gebze", "Trabzon", "Erzurum",
            "Van", "İzmit", "Sivas", "Balıkesir", "Manisa",
            "Tarsus", "Elazığ", "Kahramanmaraş", "Kocaeli", "Tekirdağ",
            "Hatay", "Antakya", "Isparta", "Çorum", "Kırıkkale",
            "Zonguldak", "Osmaniye", "Edirne", "Afyonkarahisar", "Batman",
            "Ordu", "Giresun", "Rize", "Artvin", "Amasya",
            "Nevşehir", "Aksaray", "Niğde", "Mardin", "Şırnak",
            "Bingöl", "Muş", "Bitlis", "Siirt", "Hakkari",
            "Ağrı", "Iğdır", "Kars", "Ardahan", "Erzincan",
            "Tokat", "Yozgat", "Kırşehir", "Çankırı", "Kastamonu",
            "Sinop", "Karabük", "Bartın", "Bolu", "Düzce",
            "Other"
        ],
        mother_tongues: [
            "Turkish", "Kurdish", "Arabic", "Urdu", "Punjabi",
            "Pashto", "Persian (Farsi)", "Other"
        ],
    },

    // ── 28. Malaysia ──────────────────────────────────────────────────────────
    Malaysia: {
        flag: "🇲🇾",
        currencies: ["MYR"],
        nationalities: ["Malaysian", "Pakistani-Malaysian", "Other"],
        cities: [
            "Kuala Lumpur", "George Town", "Ipoh", "Shah Alam", "Petaling Jaya",
            "Johor Bahru", "Subang Jaya", "Klang", "Ampang Jaya", "Malacca City",
            "Kota Kinabalu", "Kuching", "Alor Setar", "Miri", "Seremban",
            "Kota Bahru", "Kuantan", "Sandakan", "Kuala Terengganu", "Sungai Petani",
            "Tawau", "Sibu", "Batu Pahat", "Taiping", "Kluang",
            "Kangar", "Port Dickson", "Temerloh", "Bentong", "Kulim",
            "Seri Manjung", "Teluk Intan", "Lumut", "Manjung", "Bintulu",
            "Sarikei", "Lahad Datu", "Semporna", "Keningau", "Beaufort",
            "Ranau", "Kota Belud", "Papar", "Tuaran", "Penampang",
            "Putrajaya", "Cyberjaya", "Nilai", "Rawang", "Sepang",
            "Bangi", "Kajang", "Cheras", "Ampang", "Puchong",
            "Other"
        ],
        mother_tongues: [
            "Malay (Bahasa Malaysia)", "Urdu", "Punjabi", "Pashto",
            "Mandarin", "Tamil", "English", "Other"
        ],
    },

    // ── 29. New Zealand ───────────────────────────────────────────────────────
    "New Zealand": {
        flag: "🇳🇿",
        currencies: ["NZD"],
        nationalities: ["New Zealander", "Pakistani-Kiwi", "Other"],
        cities: [
            // North Island
            "Auckland", "Hamilton", "Tauranga", "Wellington", "Palmerston North",
            "Napier", "Hastings", "Rotorua", "New Plymouth", "Whangarei",
            "Whanganui", "Gisborne", "Upper Hutt", "Lower Hutt", "Porirua",
            "Masterton", "Levin", "Tokoroa", "Taupo", "Whakatane",
            "Pukekohe", "Papakura", "Manukau", "Henderson", "Waitakere",
            "North Shore", "Hibiscus Coast", "Orewa",
            // South Island
            "Christchurch", "Dunedin", "Nelson", "Invercargill", "Timaru",
            "Blenheim", "Oamaru", "Ashburton", "Greymouth", "Hokitika",
            "Kaikōura", "Picton", "Westport", "Queenstown", "Wānaka",
            "Alexandra", "Gore", "Balclutha", "Mosgiel", "Cromwell",
            "Other"
        ],
        mother_tongues: [
            "English", "Māori", "Urdu", "Punjabi", "Pashto",
            "Samoan", "Hindi", "Mandarin", "Other"
        ],
    },
};


const ALL_COUNTRIES = Object.keys(COUNTRY_OPTIONS);

// @ts-ignore
const ALL_NATIONALITIES = [...new Set(
    Object.values(COUNTRY_OPTIONS).flatMap(c => c.nationalities)
)].sort();

// All unique cities across every country
// @ts-ignore
const ALL_CITIES = [...new Set(
    Object.values(COUNTRY_OPTIONS).flatMap(c => c.cities)
)].sort();

// All unique currencies  e.g. ["AED", "AUD", "BHD", ...]
// @ts-ignore
const ALL_CURRENCIES = [...new Set(
    Object.values(COUNTRY_OPTIONS).flatMap(c => c.currencies)
)].sort();

// All unique mother tongues across every country
// @ts-ignore
const ALL_MOTHER_TONGUES = [...new Set(
    Object.values(COUNTRY_OPTIONS).flatMap(c => c.mother_tongues)
)].sort();

// Map: country name → its primary currency  e.g. { Pakistan: "PKR", UAE: "AED" }
const COUNTRY_TO_CURRENCY = Object.fromEntries(
    Object.entries(COUNTRY_OPTIONS).map(([country, data]) => [country, data.currencies[0]])
);

// Map: currency → array of countries that use it  e.g. { EUR: ["Germany", "France", ...] }
const CURRENCY_TO_COUNTRIES = Object.entries(COUNTRY_OPTIONS).reduce((acc, [country, data]) => {
    const currency = data.currencies[0];
    if (!acc[currency]) acc[currency] = [];
    acc[currency].push(country);
    return acc;
}, {});

// Map: country name → flag emoji  e.g. { Pakistan: "🇵🇰", UAE: "🇦🇪" }
const COUNTRY_FLAGS = Object.fromEntries(
    Object.entries(COUNTRY_OPTIONS).map(([country, data]) => [country, data.flag])
);

// Map: country name → its cities array
const COUNTRY_CITIES = Object.fromEntries(
    Object.entries(COUNTRY_OPTIONS).map(([country, data]) => [country, data.cities])
);

// Map: country name → salary ranges for that country's currency
const COUNTRY_SALARY_RANGES = Object.fromEntries(
    Object.entries(COUNTRY_OPTIONS).map(([country, data]) => [
        country,
        SALARY_BY_CURRENCY[data.currencies[0]] ?? []
    ])
);

module.exports = {
    OPTIONS,
    COUNTRY_OPTIONS,
    SALARY_BY_CURRENCY,
    ALL_COUNTRIES,
    ALL_NATIONALITIES,
    ALL_CITIES,
    ALL_CURRENCIES,
    ALL_MOTHER_TONGUES,
    COUNTRY_TO_CURRENCY,
    CURRENCY_TO_COUNTRIES,
    COUNTRY_FLAGS,
    COUNTRY_CITIES,
    COUNTRY_SALARY_RANGES,
};