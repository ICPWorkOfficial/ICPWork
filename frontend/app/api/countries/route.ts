import { NextResponse } from 'next/server';

// Comprehensive list of countries with their states/provinces
const countriesData = {
  "Afghanistan": {
    "states": ["Badakhshan", "Badghis", "Baghlan", "Balkh", "Bamyan", "Daykundi", "Farah", "Faryab", "Ghazni", "Ghor", "Helmand", "Herat", "Jowzjan", "Kabul", "Kandahar", "Kapisa", "Khost", "Kunar", "Kunduz", "Laghman", "Logar", "Nangarhar", "Nimruz", "Nuristan", "Paktia", "Paktika", "Panjshir", "Parwan", "Samangan", "Sar-e Pol", "Takhar", "Urozgan", "Wardak", "Zabul"]
  },
  "Albania": {
    "states": ["Berat", "Dibër", "Durrës", "Elbasan", "Fier", "Gjirokastër", "Korçë", "Kukës", "Lezhë", "Shkodër", "Tirana", "Vlorë"]
  },
  "Algeria": {
    "states": ["Adrar", "Aïn Defla", "Aïn Témouchent", "Algiers", "Annaba", "Batna", "Béchar", "Béjaïa", "Biskra", "Blida", "Bordj Bou Arréridj", "Bouira", "Boumerdès", "Chlef", "Constantine", "Djelfa", "El Bayadh", "El Oued", "El Tarf", "Ghardaïa", "Guelma", "Illizi", "Jijel", "Khenchela", "Laghouat", "Mascara", "Médéa", "Mila", "Mostaganem", "Msila", "Naâma", "Oran", "Ouargla", "Oum el Bouaghi", "Relizane", "Saïda", "Sétif", "Sidi Bel Abbès", "Skikda", "Souk Ahras", "Tamanghasset", "Tébessa", "Tiaret", "Tindouf", "Tipaza", "Tissemsilt", "Tizi Ouzou", "Tlemcen"]
  },
  "Argentina": {
    "states": ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"]
  },
  "Australia": {
    "states": ["Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"]
  },
  "Austria": {
    "states": ["Burgenland", "Carinthia", "Lower Austria", "Salzburg", "Styria", "Tyrol", "Upper Austria", "Vienna", "Vorarlberg"]
  },
  "Bangladesh": {
    "states": ["Barisal", "Chittagong", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet"]
  },
  "Belgium": {
    "states": ["Antwerp", "East Flanders", "Flemish Brabant", "Hainaut", "Liège", "Limburg", "Luxembourg", "Namur", "Walloon Brabant", "West Flanders"]
  },
  "Brazil": {
    "states": ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"]
  },
  "Canada": {
    "states": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"]
  },
  "Chile": {
    "states": ["Aisén", "Antofagasta", "Araucanía", "Arica y Parinacota", "Atacama", "Bío Bío", "Coquimbo", "Los Lagos", "Los Ríos", "Magallanes", "Maule", "Ñuble", "O'Higgins", "Santiago", "Tarapacá", "Valparaíso"]
  },
  "China": {
    "states": ["Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", "Inner Mongolia", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Ningxia", "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan", "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang"]
  },
  "Colombia": {
    "states": ["Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"]
  },
  "Denmark": {
    "states": ["Capital Region", "Central Jutland", "North Jutland", "Region Zealand", "South Denmark"]
  },
  "Egypt": {
    "states": ["Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta", "Faiyum", "Gharbia", "Giza", "Ismailia", "Kafr el-Sheikh", "Luxor", "Matrouh", "Minya", "Monufia", "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea", "Sharqia", "Sohag", "South Sinai", "Suez"]
  },
  "Finland": {
    "states": ["Åland", "Central Finland", "Central Ostrobothnia", "Kainuu", "Kymenlaakso", "Lapland", "North Karelia", "North Ostrobothnia", "North Savo", "Ostrobothnia", "Pirkanmaa", "Päijät-Häme", "Satakunta", "South Karelia", "South Ostrobothnia", "South Savo", "Southwest Finland", "Tavastia Proper", "Uusimaa"]
  },
  "France": {
    "states": ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire", "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"]
  },
  "Germany": {
    "states": ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"]
  },
  "Ghana": {
    "states": ["Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "Northern", "North East", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"]
  },
  "Greece": {
    "states": ["Attica", "Central Greece", "Central Macedonia", "Crete", "East Macedonia and Thrace", "Epirus", "Ionian Islands", "North Aegean", "Peloponnese", "South Aegean", "Thessaly", "West Greece", "West Macedonia"]
  },
  "India": {
    "states": ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"]
  },
  "Indonesia": {
    "states": ["Aceh", "Bali", "Banten", "Bengkulu", "Central Java", "Central Kalimantan", "Central Sulawesi", "East Java", "East Kalimantan", "East Nusa Tenggara", "Gorontalo", "Jakarta", "Jambi", "Lampung", "Maluku", "North Kalimantan", "North Maluku", "North Sulawesi", "North Sumatra", "Papua", "Riau", "Riau Islands", "South Kalimantan", "South Sulawesi", "South Sumatra", "Southeast Sulawesi", "West Java", "West Kalimantan", "West Nusa Tenggara", "West Papua", "West Sulawesi", "West Sumatra", "Yogyakarta"]
  },
  "Ireland": {
    "states": ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"]
  },
  "Italy": {
    "states": ["Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardy", "Marche", "Molise", "Piedmont", "Puglia", "Sardinia", "Sicily", "Trentino-Alto Adige", "Tuscany", "Umbria", "Valle d'Aosta", "Veneto"]
  },
  "Japan": {
    "states": ["Aichi", "Akita", "Aomori", "Chiba", "Ehime", "Fukui", "Fukuoka", "Fukushima", "Gifu", "Gunma", "Hiroshima", "Hokkaido", "Hyogo", "Ibaraki", "Ishikawa", "Iwate", "Kagawa", "Kagoshima", "Kanagawa", "Kochi", "Kumamoto", "Kyoto", "Mie", "Miyagi", "Miyazaki", "Nagano", "Nagasaki", "Nara", "Niigata", "Oita", "Okayama", "Okinawa", "Osaka", "Saga", "Saitama", "Shiga", "Shimane", "Shizuoka", "Tochigi", "Tokushima", "Tokyo", "Tottori", "Toyama", "Wakayama", "Yamagata", "Yamaguchi", "Yamanashi"]
  },
  "Kenya": {
    "states": ["Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"]
  },
  "Malaysia": {
    "states": ["Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Labuan", "Malacca", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Putrajaya", "Sabah", "Sarawak", "Selangor", "Terengganu"]
  },
  "Mexico": {
    "states": ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Mexico", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"]
  },
  "Netherlands": {
    "states": ["Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen", "Limburg", "North Brabant", "North Holland", "Overijssel", "South Holland", "Utrecht", "Zeeland"]
  },
  "New Zealand": {
    "states": ["Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatu-Wanganui", "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman", "Waikato", "Wellington", "West Coast"]
  },
  "Nigeria": {
    "states": ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"]
  },
  "Norway": {
    "states": ["Agder", "Innlandet", "Møre og Romsdal", "Nordland", "Oslo", "Rogaland", "Troms og Finnmark", "Trøndelag", "Vestfold og Telemark", "Vestland", "Viken"]
  },
  "Pakistan": {
    "states": ["Balochistan", "Gilgit-Baltistan", "Islamabad", "Khyber Pakhtunkhwa", "Punjab", "Sindh"]
  },
  "Peru": {
    "states": ["Amazonas", "Ancash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"]
  },
  "Philippines": {
    "states": ["Abra", "Agusan del Norte", "Agusan del Sur", "Aklan", "Albay", "Antique", "Apayao", "Aurora", "Basilan", "Bataan", "Batanes", "Batangas", "Benguet", "Biliran", "Bohol", "Bukidnon", "Bulacan", "Cagayan", "Camarines Norte", "Camarines Sur", "Camiguin", "Capiz", "Catanduanes", "Cavite", "Cebu", "Cotabato", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental", "Dinagat Islands", "Eastern Samar", "Guimaras", "Ifugao", "Ilocos Norte", "Ilocos Sur", "Iloilo", "Isabela", "Kalinga", "Laguna", "Lanao del Norte", "Lanao del Sur", "La Union", "Las Piñas", "Maguindanao", "Marinduque", "Masbate", "Metro Manila", "Misamis Occidental", "Misamis Oriental", "Mountain Province", "Negros Occidental", "Negros Oriental", "Northern Samar", "Nueva Ecija", "Nueva Vizcaya", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Pampanga", "Pangasinan", "Quezon", "Quirino", "Rizal", "Romblon", "Samar", "Sarangani", "Siquijor", "Sorsogon", "South Cotabato", "Southern Leyte", "Sultan Kudarat", "Sulu", "Surigao del Norte", "Surigao del Sur", "Tarlac", "Tawi-Tawi", "Zambales", "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"]
  },
  "Poland": {
    "states": ["Greater Poland", "Kuyavian-Pomeranian", "Lesser Poland", "Łódź", "Lower Silesian", "Lublin", "Lubusz", "Masovian", "Opole", "Podlaskie", "Pomeranian", "Silesian", "Subcarpathian", "Świętokrzyskie", "Warmian-Masurian", "West Pomeranian"]
  },
  "Portugal": {
    "states": ["Açores", "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro", "Guarda", "Leiria", "Lisboa", "Madeira", "Portalegre", "Porto", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu"]
  },
  "Romania": {
    "states": ["Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brăila", "Brașov", "Bucharest", "Buzău", "Călărași", "Caraș-Severin", "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui", "Vrancea"]
  },
  "Russia": {
    "states": ["Adygea", "Altai", "Altai Krai", "Amur", "Arkhangelsk", "Astrakhan", "Bashkortostan", "Belgorod", "Bryansk", "Buryatia", "Chechnya", "Chelyabinsk", "Chukotka", "Chuvashia", "Crimea", "Dagestan", "Ingushetia", "Irkutsk", "Ivanovo", "Jewish Autonomous", "Kabardino-Balkaria", "Kaliningrad", "Kalmykia", "Kaluga", "Kamchatka", "Karachay-Cherkessia", "Karelia", "Kemerovo", "Khabarovsk", "Khakassia", "Khanty-Mansi", "Kirov", "Komi", "Kostroma", "Krasnodar", "Krasnoyarsk", "Kurgan", "Kursk", "Leningrad", "Lipetsk", "Magadan", "Mari El", "Mordovia", "Moscow", "Moscow Oblast", "Murmansk", "Nenets", "Nizhny Novgorod", "North Ossetia", "Novgorod", "Novosibirsk", "Omsk", "Orenburg", "Oryol", "Penza", "Perm", "Primorsky", "Pskov", "Rostov", "Ryazan", "Sakha", "Sakhalin", "Samara", "Saratov", "Smolensk", "Stavropol", "Sverdlovsk", "Tambov", "Tatarstan", "Tomsk", "Tula", "Tuva", "Tver", "Tyumen", "Udmurtia", "Ulyanovsk", "Vladimir", "Volgograd", "Vologda", "Voronezh", "Yamalo-Nenets", "Yaroslavl", "Zabaykalsky"]
  },
  "Saudi Arabia": {
    "states": ["Al Bahah", "Al Hudud ash Shamaliyah", "Al Jawf", "Al Madinah", "Al Qasim", "Ar Riyad", "Ash Sharqiyah", "Asir", "Hail", "Jazan", "Makkah", "Najran", "Tabuk"]
  },
  "Singapore": {
    "states": ["Central Region", "East Region", "North Region", "North-East Region", "West Region"]
  },
  "South Africa": {
    "states": ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"]
  },
  "South Korea": {
    "states": ["Busan", "Chungbuk", "Chungnam", "Daegu", "Daejeon", "Gangwon", "Gwangju", "Gyeongbuk", "Gyeonggi", "Gyeongnam", "Incheon", "Jeju", "Jeonbuk", "Jeonnam", "Sejong", "Seoul", "Ulsan"]
  },
  "Spain": {
    "states": ["Andalusia", "Aragon", "Asturias", "Balearic Islands", "Basque Country", "Canary Islands", "Cantabria", "Castile and León", "Castilla-La Mancha", "Catalonia", "Ceuta", "Extremadura", "Galicia", "La Rioja", "Madrid", "Melilla", "Murcia", "Navarre", "Valencian Community"]
  },
  "Sweden": {
    "states": ["Blekinge", "Dalarna", "Gävleborg", "Gotland", "Halland", "Jämtland", "Jönköping", "Kalmar", "Kronoberg", "Norrbotten", "Örebro", "Östergötland", "Skåne", "Södermanland", "Stockholm", "Uppsala", "Värmland", "Västerbotten", "Västernorrland", "Västmanland", "Västra Götaland"]
  },
  "Switzerland": {
    "states": ["Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft", "Basel-Stadt", "Bern", "Fribourg", "Geneva", "Glarus", "Graubünden", "Jura", "Lucerne", "Neuchâtel", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz", "Solothurn", "St. Gallen", "Thurgau", "Ticino", "Uri", "Valais", "Vaud", "Zug", "Zürich"]
  },
  "Thailand": {
    "states": ["Amnat Charoen", "Ang Thong", "Bangkok", "Bueng Kan", "Buriram", "Chachoengsao", "Chai Nat", "Chaiyaphum", "Chanthaburi", "Chiang Mai", "Chiang Rai", "Chonburi", "Chumphon", "Kalasin", "Kamphaeng Phet", "Kanchanaburi", "Khon Kaen", "Krabi", "Lampang", "Lamphun", "Loei", "Lopburi", "Mae Hong Son", "Maha Sarakham", "Mukdahan", "Nakhon Nayok", "Nakhon Pathom", "Nakhon Phanom", "Nakhon Ratchasima", "Nakhon Sawan", "Nakhon Si Thammarat", "Nan", "Narathiwat", "Nong Bua Lamphu", "Nong Khai", "Nonthaburi", "Pathum Thani", "Pattani", "Phangnga", "Phatthalung", "Phayao", "Phetchabun", "Phetchaburi", "Phichit", "Phitsanulok", "Phrae", "Phuket", "Prachinburi", "Prachuap Khiri Khan", "Ranong", "Ratchaburi", "Rayong", "Roi Et", "Sa Kaeo", "Sakon Nakhon", "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Saraburi", "Satun", "Sing Buri", "Sisaket", "Songkhla", "Sukhothai", "Suphan Buri", "Surat Thani", "Surin", "Tak", "Trang", "Trat", "Ubon Ratchathani", "Udon Thani", "Uthai Thani", "Uttaradit", "Yala", "Yasothon"]
  },
  "Turkey": {
    "states": ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "Istanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"]
  },
  "Ukraine": {
    "states": ["Cherkasy", "Chernihiv", "Chernivtsi", "Crimea", "Dnipropetrovsk", "Donetsk", "Ivano-Frankivsk", "Kharkiv", "Kherson", "Khmelnytskyi", "Kiev", "Kirovohrad", "Luhansk", "Lviv", "Mykolaiv", "Odessa", "Poltava", "Rivne", "Sumy", "Ternopil", "Vinnytsia", "Volyn", "Zakarpattia", "Zaporizhzhia", "Zhytomyr"]
  },
  "United Arab Emirates": {
    "states": ["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras al-Khaimah", "Sharjah", "Umm al-Quwain"]
  },
  "United Kingdom": {
    "states": ["England", "Northern Ireland", "Scotland", "Wales"]
  },
  "United States": {
    "states": ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]
  },
  "Vietnam": {
    "states": ["An Giang", "Bà Rịa-Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"]
  }
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      countries: countriesData
    });
  } catch (error: any) {
    console.error('Countries API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
