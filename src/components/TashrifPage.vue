<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import TheNavbar from "./TheNavbar.vue";

useHead({
  title: "Tashrif - BacoKitab",
});

const router = useRouter();

// Tab state: 'istilahi' | 'lughowi'
const activeTab = ref("istilahi");

// Selected Lughowi form (for Lughowi tab)
const selectedLughowiForm = ref("madhi");

// Search query
const searchQuery = ref("");

// Virtual Keyboard state
const showKeyboard = ref(false);

// --- FE Dhomir Mapping ---
const dhomir14 = [
  { pronoun: "هُوَ", meaning: "Dia (Lk)" },
  { pronoun: "هُمَا", meaning: "Mereka berdua (Lk)" },
  { pronoun: "هُمْ", meaning: "Mereka (Lk)" },
  { pronoun: "هِيَ", meaning: "Dia (Pr)" },
  { pronoun: "هُمَا", meaning: "Mereka berdua (Pr)" },
  { pronoun: "هُنَّ", meaning: "Mereka (Pr)" },
  { pronoun: "أَنْتَ", meaning: "Kamu (Lk)" },
  { pronoun: "أَنْتُمَا", meaning: "Kamu berdua (Lk)" },
  { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)" },
  { pronoun: "أَنْتِ", meaning: "Kamu (Pr)" },
  { pronoun: "أَنْتُمَا", meaning: "Kamu berdua (Pr)" },
  { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)" },
  { pronoun: "أَنَا", meaning: "Saya" },
  { pronoun: "نَحْنُ", meaning: "Kami/Kita" },
];

const dhomirAmrNahyi = [
  { pronoun: "أَنْتَ", meaning: "Kamu (Lk)" },
  { pronoun: "أَنْتُمَا", meaning: "Kamu berdua (Lk)" },
  { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)" },
  { pronoun: "أَنْتِ", meaning: "Kamu (Pr)" },
  { pronoun: "أَنْتُمَا", meaning: "Kamu berdua (Pr)" },
  { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)" },
];

const dhomirFailMaful = [
  { pronoun: "مُفْرَدْ مُذَكَّرْ", meaning: "Tunggal (Lk)" },
  { pronoun: "تَثْنِيَةْ مُذَكَّرْ", meaning: "Ganda (Lk)" },
  { pronoun: "جَمْعْ مُذَكَّرْ", meaning: "Jamak (Lk)" },
  { pronoun: "مُفْرَدْ مُؤَنَّثْ", meaning: "Tunggal (Pr)" },
  { pronoun: "تَثْنِيَةْ مُؤَنَّثْ", meaning: "Ganda (Pr)" },
  { pronoun: "جَمْعْ مُؤَنَّثْ", meaning: "Jamak (Pr)" },
];

const dhomirMasdarZamanMakan = [
  { pronoun: "مُفْرَدْ", meaning: "Tunggal" },
  { pronoun: "تَثْنِيَةْ", meaning: "Ganda" },
  { pronoun: "جَمْعْ", meaning: "Jamak" },
];

const getPronounInfo = (formId, index) => {
  let mapping = [];
  const normalizedForm = formId.replace(/[^a-zA-Z]/g, '').toLowerCase();

  if (["madhi", "madi", "mudhari"].includes(normalizedForm)) {
    mapping = dhomir14;
  } else if (["amr", "nahyi", "nahi"].includes(normalizedForm)) {
    mapping = dhomirAmrNahyi;
  } else if (["fail", "maful"].includes(normalizedForm)) {
    mapping = dhomirFailMaful;
  } else if (["mashdar", "masdar", "zamanmakan", "alat", "alah"].includes(normalizedForm)) {
    mapping = dhomirMasdarZamanMakan;
  }

  return mapping[index] || { pronoun: "-", meaning: "-" };
};

// Sample Data for Tashrif
const tashrifData = {
  nasara: {
    id: "nasara",
    arabic: "نَصَرَ",
    latin: "Nasara",
    meaning: "Menolong",
    istilahi: [
      {
        id: "madhi",
        title: "FI'IL MADHI",
        arabic: "نَصَرَ",
        meaning: "Telah menolong",
      },
      {
        id: "mudhari",
        title: "FI'IL MUDHARI",
        arabic: "يَنْصُرُ",
        meaning: "Sedang menolong",
      },
      {
        id: "mashdar",
        title: "MASHDAR",
        arabic: "نَصْرًا",
        meaning: "Pertolongan",
      },
      {
        id: "fa'il",
        title: "ISIM FA'IL",
        arabic: "نَاصِرٌ",
        meaning: "Orang yang menolong",
      },
      {
        id: "maf'ul",
        title: "ISIM MAF'UL",
        arabic: "مَنْصُوْرٌ",
        meaning: "Yang ditolong",
      },
      {
        id: "amr",
        title: "FI'IL AMR",
        arabic: "أُنْصُرْ",
        meaning: "Tolonglah!",
      },
      {
        id: "nahi",
        title: "FI'IL NAHI",
        arabic: "لَا تَنْصُرْ",
        meaning: "Jangan menolong!",
      },
      {
        id: "zaman_makan",
        title: "ISIM ZAMAN/MAKAN",
        arabic: "مَنْصَرٌ",
        meaning: "Waktu/Tempat menolong",
      },
      {
        id: "alat",
        title: "ISIM ALAT",
        arabic: "مِنْصَرٌ",
        meaning: "Alat menolong",
      },
    ],
    lughowi: {
      madhi: [
        { pronoun: "هُوَ", meaning: "Dia (Lk)", arabic: "نَصَرَ" },
        { pronoun: "هُمَا", meaning: "Mereka berdua (Lk)", arabic: "نَصَرَا" },
        { pronoun: "هُمْ", meaning: "Mereka (Lk)", arabic: "نَصَرُوا" },
        { pronoun: "هِيَ", meaning: "Dia (Pr)", arabic: "نَصَرَتْ" },
        {
          pronoun: "هُمَا",
          meaning: "Mereka berdua (Pr)",
          arabic: "نَصَرَتَا",
        },
        { pronoun: "هُنَّ", meaning: "Mereka (Pr)", arabic: "نَصَرْنَ" },
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "نَصَرْتَ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "نَصَرْتُمَا",
        },
        { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)", arabic: "نَصَرْتُمْ" },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "نَصَرْتِ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "نَصَرْتُمَا",
        },
        { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)", arabic: "نَصَرْتُنَّ" },
        { pronoun: "أَنَا", meaning: "Saya", arabic: "نَصَرْتُ" },
        { pronoun: "نَحْنُ", meaning: "Kami/Kita", arabic: "نَصَرْنَا" },
      ],
      mudhari: [
        { pronoun: "هُوَ", meaning: "Dia (Lk)", arabic: "يَنْصُرُ" },
        {
          pronoun: "هُمَا",
          meaning: "Mereka berdua (Lk)",
          arabic: "يَنْصُرَانِ",
        },
        { pronoun: "هُمْ", meaning: "Mereka (Lk)", arabic: "يَنْصُرُونَ" },
        { pronoun: "هِيَ", meaning: "Dia (Pr)", arabic: "تَنْصُرُ" },
        {
          pronoun: "هُمَا",
          meaning: "Mereka berdua (Pr)",
          arabic: "تَنْصُرَانِ",
        },
        { pronoun: "هُنَّ", meaning: "Mereka (Pr)", arabic: "يَنْصُرْنَ" },
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "تَنْصُرُ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "تَنْصُرَانِ",
        },
        { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)", arabic: "تَنْصُرُونَ" },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "تَنْصُرِينَ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "تَنْصُرَانِ",
        },
        { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)", arabic: "تَنْصُرْنَ" },
        { pronoun: "أَنَا", meaning: "Saya", arabic: "أَنْصُرُ" },
        { pronoun: "نَحْنُ", meaning: "Kami/Kita", arabic: "نَنْصُرُ" },
      ],
      "fa'il": [
        {
          pronoun: "مُفْرَدْ مُذَكَّرْ",
          meaning: "Tunggal (Lk)",
          arabic: "نَاصِرٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُذَكَّرْ",
          meaning: "Ganda (Lk)",
          arabic: "نَاصِرَانِ",
        },
        {
          pronoun: "جَمْعْ مُذَكَّرْ",
          meaning: "Jamak (Lk)",
          arabic: "نَاصِرُونَ",
        },
        {
          pronoun: "مُفْرَدْ مُؤَنَّثْ",
          meaning: "Tunggal (Pr)",
          arabic: "نَاصِرَةٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُؤَنَّثْ",
          meaning: "Ganda (Pr)",
          arabic: "نَاصِرَتَانِ",
        },
        {
          pronoun: "جَمْعْ مُؤَنَّثْ",
          meaning: "Jamak (Pr)",
          arabic: "نَاصِرَاتٌ",
        },
      ],
      mashdar: [
        { pronoun: "مُفْرَدْ", meaning: "Bentuk Tunggal", arabic: "نَصْرًا" },
      ],
      amr: [
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "أُنْصُرْ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "أُنْصُرَا",
        },
        { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)", arabic: "أُنْصُرُوا" },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "أُنْصُرِي" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "أُنْصُرَا",
        },
        { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)", arabic: "أُنْصُرْنَ" },
      ],
      "maf'ul": [
        {
          pronoun: "مُفْرَدْ مُذَكَّرْ",
          meaning: "Tunggal (Lk)",
          arabic: "مَنْصُوْرٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُذَكَّرْ",
          meaning: "Ganda (Lk)",
          arabic: "مَنْصُوْرَانِ",
        },
        {
          pronoun: "جَمْعْ مُذَكَّرْ",
          meaning: "Jamak (Lk)",
          arabic: "مَنْصُوْرُونَ",
        },
        {
          pronoun: "مُفْرَدْ مُؤَنَّثْ",
          meaning: "Tunggal (Pr)",
          arabic: "مَنْصُوْرَةٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُؤَنَّثْ",
          meaning: "Ganda (Pr)",
          arabic: "مَنْصُوْرَتَانِ",
        },
        {
          pronoun: "جَمْعْ مُؤَنَّثْ",
          meaning: "Jamak (Pr)",
          arabic: "مَنْصُوْرَاتٌ",
        },
      ],
      zaman_makan: [
        { pronoun: "مُفْرَدْ", meaning: "Tunggal", arabic: "مَنْصَرٌ" },
        { pronoun: "تَثْنِيَةْ", meaning: "Ganda", arabic: "مَنْصَرَانِ" },
        { pronoun: "جَمْعْ", meaning: "Jamak", arabic: "مَنَاصِرُ" },
      ],
      nahi: [
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "لَا تَنْصُرْ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "لَا تَنْصُرَا",
        },
        {
          pronoun: "أَنْتُمْ",
          meaning: "Kalian (Lk)",
          arabic: "لَا تَنْصُرُوا",
        },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "لَا تَنْصُرِي" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "لَا تَنْصُرَا",
        },
        {
          pronoun: "أَنْتُنَّ",
          meaning: "Kalian (Pr)",
          arabic: "لَا تَنْصُرْنَ",
        },
      ],
      alat: [
        { pronoun: "مُفْرَدْ", meaning: "Tunggal", arabic: "مِنْصَرٌ" },
        { pronoun: "تَثْنِيَةْ", meaning: "Ganda", arabic: "مِنْصَرَانِ" },
        { pronoun: "جَمْعْ", meaning: "Jamak", arabic: "مَنَاصِرُ" },
      ],
    },
  },
  kataba: {
    id: "kataba",
    arabic: "كَتَبَ",
    latin: "Kataba",
    meaning: "Menulis",
    istilahi: [
      {
        id: "madhi",
        title: "FI'IL MADHI",
        arabic: "كَتَبَ",
        meaning: "Telah menulis",
      },
      {
        id: "mudhari",
        title: "FI'IL MUDHARI",
        arabic: "يَكْتُبُ",
        meaning: "Sedang menulis",
      },
      {
        id: "mashdar",
        title: "MASHDAR",
        arabic: "كِتَابَةً",
        meaning: "Tulisan / Menulis",
      },
      {
        id: "fa'il",
        title: "ISIM FA'IL",
        arabic: "كَاتِبٌ",
        meaning: "Penulis",
      },
      {
        id: "maf'ul",
        title: "ISIM MAF'UL",
        arabic: "مَكْتُوْبٌ",
        meaning: "Yang ditulis",
      },
      {
        id: "amr",
        title: "FI'IL AMR",
        arabic: "أُكْتُبْ",
        meaning: "Tulislah!",
      },
      {
        id: "nahi",
        title: "FI'IL NAHI",
        arabic: "لَا تَكْتُبْ",
        meaning: "Jangan menulis!",
      },
      {
        id: "zaman_makan",
        title: "ISIM ZAMAN/MAKAN",
        arabic: "مَكْتَبٌ",
        meaning: "Waktu/Tempat menulis",
      },
      {
        id: "alat",
        title: "ISIM ALAT",
        arabic: "مِكْتَبٌ",
        meaning: "Alat menulis",
      },
    ],
    lughowi: {
      madhi: [
        { pronoun: "هُوَ", meaning: "Dia (Lk)", arabic: "كَتَبَ" },
        { pronoun: "هُمَا", meaning: "Mereka berdua (Lk)", arabic: "كَتَبَا" },
        { pronoun: "هُمْ", meaning: "Mereka (Lk)", arabic: "كَتَبُوا" },
        { pronoun: "هِيَ", meaning: "Dia (Pr)", arabic: "كَتَبَتْ" },
        {
          pronoun: "هُمَا",
          meaning: "Mereka berdua (Pr)",
          arabic: "كَتَبَتَا",
        },
        { pronoun: "هُنَّ", meaning: "Mereka (Pr)", arabic: "كَتَبْنَ" },
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "كَتَبْتَ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "كَتَبْتُمَا",
        },
        { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)", arabic: "كَتَبْتُمْ" },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "كَتَبْتِ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "كَتَبْتُمَا",
        },
        { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)", arabic: "كَتَبْتُنَّ" },
        { pronoun: "أَنَا", meaning: "Saya", arabic: "كَتَبْتُ" },
        { pronoun: "نَحْنُ", meaning: "Kami/Kita", arabic: "كَتَبْنَا" },
      ],
      mudhari: [
        { pronoun: "هُوَ", meaning: "Dia (Lk)", arabic: "يَكْتُبُ" },
        {
          pronoun: "هُمَا",
          meaning: "Mereka berdua (Lk)",
          arabic: "يَكْتُبَانِ",
        },
        { pronoun: "هُمْ", meaning: "Mereka (Lk)", arabic: "يَكْتُبُونَ" },
        { pronoun: "هِيَ", meaning: "Dia (Pr)", arabic: "تَكْتُبُ" },
        {
          pronoun: "هُمَا",
          meaning: "Mereka berdua (Pr)",
          arabic: "تَكْتُبَانِ",
        },
        { pronoun: "هُنَّ", meaning: "Mereka (Pr)", arabic: "يَكْتُبْنَ" },
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "تَكْتُبُ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "تَكْتُبَانِ",
        },
        { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)", arabic: "تَكْتُبُونَ" },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "تَكْتُبِينَ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "تَكْتُبَانِ",
        },
        { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)", arabic: "تَكْتُبْنَ" },
        { pronoun: "أَنَا", meaning: "Saya", arabic: "أَكْتُبُ" },
        { pronoun: "نَحْنُ", meaning: "Kami/Kita", arabic: "نَكْتُبُ" },
      ],
      "fa'il": [
        {
          pronoun: "مُفْرَدْ مُذَكَّرْ",
          meaning: "Tunggal (Lk)",
          arabic: "كَاتِبٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُذَكَّرْ",
          meaning: "Ganda (Lk)",
          arabic: "كَاتِبَانِ",
        },
        {
          pronoun: "جَمْعْ مُذَكَّرْ",
          meaning: "Jamak (Lk)",
          arabic: "كَاتِبُونَ",
        },
        {
          pronoun: "مُفْرَدْ مُؤَنَّثْ",
          meaning: "Tunggal (Pr)",
          arabic: "كَاتِبَةٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُؤَنَّثْ",
          meaning: "Ganda (Pr)",
          arabic: "كَاتِبَتَانِ",
        },
        {
          pronoun: "جَمْعْ مُؤَنَّثْ",
          meaning: "Jamak (Pr)",
          arabic: "كَاتِبَاتٌ",
        },
      ],
      mashdar: [
        { pronoun: "مُفْرَدْ", meaning: "Bentuk Tunggal", arabic: "كِتَابَةً" },
      ],
      amr: [
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "أُكْتُبْ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "أُكْتُبَا",
        },
        { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)", arabic: "أُكْتُبُوا" },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "أُكْتُبِي" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "أُكْتُبَا",
        },
        { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)", arabic: "أُكْتُبْنَ" },
      ],
      "maf'ul": [
        {
          pronoun: "مُفْرَدْ مُذَكَّرْ",
          meaning: "Tunggal (Lk)",
          arabic: "مَكْتُوْبٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُذَكَّرْ",
          meaning: "Ganda (Lk)",
          arabic: "مَكْتُوْبَانِ",
        },
        {
          pronoun: "جَمْعْ مُذَكَّرْ",
          meaning: "Jamak (Lk)",
          arabic: "مَكْتُوْبُونَ",
        },
        {
          pronoun: "مُفْرَدْ مُؤَنَّثْ",
          meaning: "Tunggal (Pr)",
          arabic: "مَكْتُوْبَةٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُؤَنَّثْ",
          meaning: "Ganda (Pr)",
          arabic: "مَكْتُوْبَتَانِ",
        },
        {
          pronoun: "جَمْعْ مُؤَنَّثْ",
          meaning: "Jamak (Pr)",
          arabic: "مَكْتُوْبَاتٌ",
        },
      ],
      zaman_makan: [
        { pronoun: "مُفْرَدْ", meaning: "Tunggal", arabic: "مَكْتَبٌ" },
        { pronoun: "تَثْنِيَةْ", meaning: "Ganda", arabic: "مَكْتَبَانِ" },
        { pronoun: "جَمْعْ", meaning: "Jamak", arabic: "مَكَاتِبُ" },
      ],
      nahi: [
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "لَا تَكْتُبْ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "لَا تَكْتُبَا",
        },
        {
          pronoun: "أَنْتُمْ",
          meaning: "Kalian (Lk)",
          arabic: "لَا تَكْتُبُوا",
        },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "لَا تَكْتُبِي" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "لَا تَكْتُبَا",
        },
        {
          pronoun: "أَنْتُنَّ",
          meaning: "Kalian (Pr)",
          arabic: "لَا تَكْتُبْنَ",
        },
      ],
      alat: [
        { pronoun: "مُفْرَدْ", meaning: "Tunggal", arabic: "مِكْتَبٌ" },
        { pronoun: "تَثْنِيَةْ", meaning: "Ganda", arabic: "مِكْتَبَانِ" },
        { pronoun: "جَمْعْ", meaning: "Jamak", arabic: "مَكَاتِبُ" },
      ],
    },
  },
  khatama: {
    id: "khatama",
    arabic: "خَتَمَ",
    latin: "Khatama",
    meaning: "Menutup",
    istilahi: [
      {
        id: "madhi",
        title: "FI'IL MADHI",
        arabic: "خَتَمَ",
        meaning: "Telah menutup",
      },
      {
        id: "mudhari",
        title: "FI'IL MUDHARI",
        arabic: "يَخْتِمُ",
        meaning: "Sedang menutup",
      },
      {
        id: "mashdar",
        title: "MASHDAR",
        arabic: "خَتْمًا",
        meaning: "Penutupan / Stempel",
      },
      {
        id: "fa'il",
        title: "ISIM FA'IL",
        arabic: "خَاتِمٌ",
        meaning: "Penutup / Cincin",
      },
      {
        id: "maf'ul",
        title: "ISIM MAF'UL",
        arabic: "مَخْتُوْمٌ",
        meaning: "Yang ditutup",
      },
      {
        id: "amr",
        title: "FI'IL AMR",
        arabic: "إِخْتِمْ",
        meaning: "Tutuplah!",
      },
      {
        id: "nahi",
        title: "FI'IL NAHI",
        arabic: "لَا تَخْتِمْ",
        meaning: "Jangan menutup!",
      },
      {
        id: "zaman_makan",
        title: "ISIM ZAMAN/MAKAN",
        arabic: "مَخْتَمٌ",
        meaning: "Waktu/Tempat menutup",
      },
      {
        id: "alat",
        title: "ISIM ALAT",
        arabic: "مِخْتَمٌ",
        meaning: "Alat menutup",
      },
    ],
    lughowi: {
      madhi: [
        { pronoun: "هُوَ", meaning: "Dia (Lk)", arabic: "خَتَمَ" },
        { pronoun: "هُمَا", meaning: "Mereka berdua (Lk)", arabic: "خَتَمَا" },
        { pronoun: "هُمْ", meaning: "Mereka (Lk)", arabic: "خَتَمُوا" },
        { pronoun: "هِيَ", meaning: "Dia (Pr)", arabic: "خَتَمَتْ" },
        {
          pronoun: "هُمَا",
          meaning: "Mereka berdua (Pr)",
          arabic: "خَتَمَتَا",
        },
        { pronoun: "هُنَّ", meaning: "Mereka (Pr)", arabic: "خَتَمْنَ" },
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "خَتَمْتَ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "خَتَمْتُمَا",
        },
        { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)", arabic: "خَتَمْتُمْ" },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "خَتَمْتِ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "خَتَمْتُمَا",
        },
        { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)", arabic: "خَتَمْتُنَّ" },
        { pronoun: "أَنَا", meaning: "Saya", arabic: "خَتَمْتُ" },
        { pronoun: "نَحْنُ", meaning: "Kami/Kita", arabic: "خَتَمْنَا" },
      ],
      mudhari: [
        { pronoun: "هُوَ", meaning: "Dia (Lk)", arabic: "يَخْتِمُ" },
        {
          pronoun: "هُمَا",
          meaning: "Mereka berdua (Lk)",
          arabic: "يَخْتِمَانِ",
        },
        { pronoun: "هُمْ", meaning: "Mereka (Lk)", arabic: "يَخْتِمُونَ" },
        { pronoun: "هِيَ", meaning: "Dia (Pr)", arabic: "تَخْتِمُ" },
        {
          pronoun: "هُمَا",
          meaning: "Mereka berdua (Pr)",
          arabic: "تَخْتِمَانِ",
        },
        { pronoun: "هُنَّ", meaning: "Mereka (Pr)", arabic: "يَخْتِمْنَ" },
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "تَخْتِمُ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "تَخْتِمَانِ",
        },
        { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)", arabic: "تَخْتِمُونَ" },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "تَخْتِمِينَ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "تَخْتِمَانِ",
        },
        { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)", arabic: "تَخْتِمْنَ" },
        { pronoun: "أَنَا", meaning: "Saya", arabic: "أَخْتِمُ" },
        { pronoun: "نَحْنُ", meaning: "Kami/Kita", arabic: "نَخْتِمُ" },
      ],
      "fa'il": [
        {
          pronoun: "مُفْرَدْ مُذَكَّرْ",
          meaning: "Tunggal (Lk)",
          arabic: "خَاتِمٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُذَكَّرْ",
          meaning: "Ganda (Lk)",
          arabic: "خَاتِمَانِ",
        },
        {
          pronoun: "جَمْعْ مُذَكَّرْ",
          meaning: "Jamak (Lk)",
          arabic: "خَاتِمُونَ",
        },
        {
          pronoun: "مُفْرَدْ مُؤَنَّثْ",
          meaning: "Tunggal (Pr)",
          arabic: "خَاتِمَةٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُؤَنَّثْ",
          meaning: "Ganda (Pr)",
          arabic: "خَاتِمَتَانِ",
        },
        {
          pronoun: "جَمْعْ مُؤَنَّثْ",
          meaning: "Jamak (Pr)",
          arabic: "خَاتِمَاتٌ",
        },
      ],
      mashdar: [
        { pronoun: "مُفْرَدْ", meaning: "Bentuk Tunggal", arabic: "خَتْمًا" },
      ],
      amr: [
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "إِخْتِمْ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "إِخْتِمَا",
        },
        { pronoun: "أَنْتُمْ", meaning: "Kalian (Lk)", arabic: "إِخْتِمُوا" },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "إِخْتِمِي" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "إِخْتِمَا",
        },
        { pronoun: "أَنْتُنَّ", meaning: "Kalian (Pr)", arabic: "إِخْتِمْنَ" },
      ],
      "maf'ul": [
        {
          pronoun: "مُفْرَدْ مُذَكَّرْ",
          meaning: "Tunggal (Lk)",
          arabic: "مَخْتُوْمٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُذَكَّرْ",
          meaning: "Ganda (Lk)",
          arabic: "مَخْتُوْمَانِ",
        },
        {
          pronoun: "جَمْعْ مُذَكَّرْ",
          meaning: "Jamak (Lk)",
          arabic: "مَخْتُوْمُونَ",
        },
        {
          pronoun: "مُفْرَدْ مُؤَنَّثْ",
          meaning: "Tunggal (Pr)",
          arabic: "مَخْتُوْمَةٌ",
        },
        {
          pronoun: "تَثْنِيَةْ مُؤَنَّثْ",
          meaning: "Ganda (Pr)",
          arabic: "مَخْتُوْمَتَانِ",
        },
        {
          pronoun: "جَمْعْ مُؤَنَّثْ",
          meaning: "Jamak (Pr)",
          arabic: "مَخْتُوْمَاتٌ",
        },
      ],
      zaman_makan: [
        { pronoun: "مُفْرَدْ", meaning: "Tunggal", arabic: "مَخْتَمٌ" },
        { pronoun: "تَثْنِيَةْ", meaning: "Ganda", arabic: "مَخْتَمَانِ" },
        { pronoun: "جَمْعْ", meaning: "Jamak", arabic: "مَخَاتِمُ" },
      ],
      nahi: [
        { pronoun: "أَنْتَ", meaning: "Kamu (Lk)", arabic: "لَا تَخْتِمْ" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Lk)",
          arabic: "لَا تَخْتِمَا",
        },
        {
          pronoun: "أَنْتُمْ",
          meaning: "Kalian (Lk)",
          arabic: "لَا تَخْتِمُوا",
        },
        { pronoun: "أَنْتِ", meaning: "Kamu (Pr)", arabic: "لَا تَخْتِمِي" },
        {
          pronoun: "أَنْتُمَا",
          meaning: "Kamu berdua (Pr)",
          arabic: "لَا تَخْتِمَا",
        },
        {
          pronoun: "أَنْتُنَّ",
          meaning: "Kalian (Pr)",
          arabic: "لَا تَخْتِمْنَ",
        },
      ],
      alat: [
        { pronoun: "مُفْرَدْ", meaning: "Tunggal", arabic: "مِخْتَمٌ" },
        { pronoun: "تَثْنِيَةْ", meaning: "Ganda", arabic: "مِخْتَمَانِ" },
        { pronoun: "جَمْعْ", meaning: "Jamak", arabic: "مَخَاتِمُ" },
      ],
    },
  },
};

// API mapping function
const mapApiResponseToActiveWord = (apiResponse) => {
  const t = apiResponse.tashrif || {};

  const istilahiMap = [
    { id: "madhi", title: "FI'IL MADHI", arabic: t.madi?.sh, meaning: t.madi?.arti },
    { id: "mudhari", title: "FI'IL MUDHARI", arabic: t.mudhari?.sh, meaning: t.mudhari?.arti },
    { id: "mashdar", title: "MASHDAR", arabic: t.masdar?.sh, meaning: t.masdar?.arti },
    { id: "fa'il", title: "ISIM FA'IL", arabic: t.fail?.sh, meaning: t.fail?.arti },
    { id: "maf'ul", title: "ISIM MAF'UL", arabic: t.maful?.sh, meaning: t.maful?.arti },
    { id: "amr", title: "FI'IL AMR", arabic: t.amr?.sh, meaning: t.amr?.arti },
    { id: "nahi", title: "FI'IL NAHI", arabic: t.nahyi?.sh, meaning: t.nahyi?.arti },
    { id: "zaman_makan", title: "ISIM ZAMAN/MAKAN", arabic: t.zaman_makan?.sh, meaning: t.zaman_makan?.arti },
    { id: "alat", title: "ISIM ALAT", arabic: t.alah?.sh, meaning: t.alah?.arti },
  ].filter((item) => item.arabic && item.arabic !== "-");

  const lughowiMap = {
    madhi: t.madi?.lg || [],
    mudhari: t.mudhari?.lg || [],
    mashdar: t.masdar?.lg || [],
    "fa'il": t.fail?.lg || [],
    "maf'ul": t.maful?.lg || [],
    amr: t.amr?.lg || [],
    nahi: t.nahyi?.lg || [],
    zaman_makan: t.zaman_makan?.lg || [],
    alat: t.alah?.lg || [],
  };

  return {
    id: "api_result",
    arabic: apiResponse.in,
    latin: apiResponse.meta?.wazan || "",
    meaning: t.madi?.arti || "",
    istilahi: istilahiMap,
    lughowi: lughowiMap,
  };
};

const dummyJalasaResponse = {
  "in": "جَلَسَ",
  "meta": {
    "root": "ج ل س",
    "wazan": "فَعَلَ - يَفْعِلُ"
  },
  "tashrif": {
    "madi": {
      "sh": "جَلَسَ",
      "lg": ["جَلَسَ", "جَلَسَا", "جَلَسُوا", "جَلَسَتْ", "جَلَسَتَا", "جَلَسْنَا", "جَلَسْتَ", "جَلَسْتُمَا", "جَلَسْتُمْ", "جَلَسْتِ", "جَلَسْتُمَا", "جَلَسْتُنَّ", "جَلَسْتُ", "جَلَسْنَا"],
      "arti": "telah duduk"
    },
    "mudhari": {
      "sh": "يَجْلِسُ",
      "lg": ["يَجْلِسُ", "يَجْلِسَانِ", "يَجْلِسُونَ", "تَجْلِسُ", "تَجْلِسَانِ", "يَجْلِسْنَا", "تَجْلِسُ", "تَجْلِسَانِ", "تَجْلِسُونَ", "تَجْلِسِينَ", "تَجْلِسَانِ", "تَجْلِسْنَا", "أَجْلِسُ", "نَجْلِسُ"],
      "arti": "sedang/akan duduk"
    },
    "masdar": {
      "sh": "جُلُوسٌ",
      "lg": ["جُلُوسٌ", "جُلُوسَانِ", "جُلُوسَاتٌ"],
      "arti": "hal duduk / duduk"
    },
    "fail": {
      "sh": "جَالِسٌ",
      "lg": ["جَالِسٌ", "جَالِسَانِ", "جَالِسُونَ / جُلَّاسٌ", "جَالِسَةٌ", "جَالِسَتَانِ", "جَالِسَاتٌ"],
      "arti": "orang yang duduk"
    },
    "maful": {
      "sh": "مَجْلُوسٌ",
      "lg": ["مَجْلُوسٌ", "مَجْلُوسَانِ", "مَجْلُوسُونَ", "مَجْلُوسَةٌ", "مَجْلُوسَتَانِ", "مَجْلُوسَاتٌ"],
      "arti": "yang diduduki"
    },
    "amr": {
      "sh": "اِجْلِسْ",
      "lg": ["اِجْلِسْ", "اِجْلِسَا", "اِجْلِسُوا", "اِجْلِسِي", "اِجْلِسَا", "اِجْلِسْنَا"],
      "arti": "duduklah!"
    },
    "nahyi": {
      "sh": "لَا تَجْلِسْ",
      "lg": ["لَا تَجْلِسْ", "لَا تَجْلِسَا", "لَا تَجْلِسُوا", "لَا تَجْلِسِي", "لَا تَجْلِسَا", "لَا تَجْلِسْنَا"],
      "arti": "jangan duduk!"
    },
    "zaman_makan": {
      "sh": "مَجْلِسٌ",
      "lg": ["مَجْلِسٌ", "مَجْلِسَانِ", "مَجَالِسُ"],
      "arti": "tempat/waktu duduk (majelis)"
    },
    "alah": {
      "sh": "-",
      "lg": [],
      "arti": "-"
    }
  }
};

const isSearching = ref(false);
const activeWord = ref(mapApiResponseToActiveWord(dummyJalasaResponse));

// Select word from suggestion pills
const selectWord = (wordKey) => {
  searchQuery.value = tashrifData[wordKey].arabic;
  showKeyboard.value = false;
  performSearch();
};

// Clear search input
const clearSearch = () => {
  searchQuery.value = "";
  activeWord.value = mapApiResponseToActiveWord(dummyJalasaResponse);
};

// Perform search to backend
const performSearch = async () => {
  const query = searchQuery.value.trim();
  if (!query) {
    activeWord.value = mapApiResponseToActiveWord(dummyJalasaResponse);
    return;
  }

  isSearching.value = true;
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/tashrif`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: query }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.tashrif) {
        activeWord.value = mapApiResponseToActiveWord(data);
      }
    } else {
      console.error("API error", response.status);
    }
  } catch (error) {
    console.error("Failed to fetch tashrif", error);
  } finally {
    isSearching.value = false;
  }
};

// Virtual keyboard buttons (letters and diacritics)
const arabicKeys = [
  "أ",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "هـ",
  "و",
  "ي",
  "ء",
  "ئ",
  "ؤ",
  "ى",
  "ة",
  "ا",
  "لأ",
  "لإ",
  "َ" /* Fathah */,
  "ُ" /* Dammah */,
  "ِ" /* Kasrah */,
  "ً" /* Fathatain */,
  "ٌ" /* Dammatain */,
  "ٍ" /* Kasratain */,
  "ْ" /* Sukun */,
  "ّ" /* Shaddah */,
  "ٓ" /* Maddah */,
];

// Type character into search query
const typeChar = (char) => {
  searchQuery.value += char;
  handleSearchInput();
};

// Delete character from search query
const deleteChar = () => {
  if (searchQuery.value.length > 0) {
    searchQuery.value = searchQuery.value.slice(0, -1);
    handleSearchInput();
  }
};

// Navigation to lughowi tab and set selected form
const viewLughowi = (formId) => {
  selectedLughowiForm.value = formId;
  activeTab.value = "lughowi";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Map form ID to display title
const getFormTitle = (formId) => {
  const titles = {
    madhi: "Fi'il Madhi (فعل ماض)",
    mudhari: "Fi'il Mudhari (فعل مضارع)",
    "fa'il": "Isim Fa'il (اسم فاعل)",
    mashdar: "Mashdar (مصدر)",
    amr: "Fi'il Amr (فعل أمر)",
    "maf'ul": "Isim Maf'ul (اسم مفعول)",
    zaman_makan: "Isim Zaman/Makan (اسم زمان/مكان)",
    nahi: "Fi'il Nahi (فعل نهي)",
    alat: "Isim Alat (اسم آلة)",
  };
  return titles[formId] || formId;
};
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-gray-50/50 dark:bg-[#111814] font-display"
  >
    <TheNavbar />

    <main class="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-32 space-y-6">
      <!-- Header section to match other page subheaders -->
      <div
        class="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-4 mb-2"
      >
        <div class="flex items-center gap-3">
          <button
            @click="router.push('/home')"
            class="p-2 bg-gray-100/50 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all active:scale-95 flex items-center justify-center text-[#111814] dark:text-white"
            title="Kembali ke Dashboard"
          >
            <span class="material-symbols-outlined font-bold">arrow_back</span>
          </button>
          <h2
            class="text-2xl font-bold tracking-tight text-[#111814] dark:text-white flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-primary text-3xl"
              >auto_stories</span
            >
            Tashrif
          </h2>
        </div>
      </div>

      <!-- Search Input Card -->
      <div
        class="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4"
      >
        <!-- Search Input -->
        <div class="relative">
          <div
            class="flex items-center border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 px-3.5 py-3 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all"
          >
            <button
              @click="showKeyboard = !showKeyboard"
              class="text-gray-400 hover:text-primary transition-colors mr-2.5 flex items-center"
            >
              <span class="material-symbols-outlined text-[22px]"
                >keyboard</span
              >
            </button>
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="performSearch"
              dir="rtl"
              placeholder="نَصَرَ : (contoh) Cari kata Arab"
              class="w-full bg-transparent border-none p-0 focus:ring-0 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-right font-arabic font-bold"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="text-gray-400 hover:text-gray-650 ml-2"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <!-- Virtual Keyboard Dropdown -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showKeyboard"
              class="absolute left-0 right-0 mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50"
            >
              <div class="flex justify-between items-center mb-2 px-1">
                <span
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400"
                  >Papan Ketik Arab</span
                >
                <button
                  @click="showKeyboard = false"
                  class="text-xs text-primary font-bold hover:underline"
                >
                  Tutup
                </button>
              </div>
              <div
                class="grid grid-cols-6 gap-1.5 max-h-[180px] overflow-y-auto p-1"
                dir="rtl"
              >
                <button
                  v-for="char in arabicKeys"
                  :key="char"
                  @click="typeChar(char)"
                  class="bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 active:scale-95 text-gray-800 dark:text-white font-arabic font-bold py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-center text-lg shadow-sm transition-all"
                >
                  {{ char }}
                </button>
                <button
                  @click="deleteChar"
                  class="col-span-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 font-bold py-1.5 rounded-lg text-sm flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <span class="material-symbols-outlined text-[18px]"
                    >backspace</span
                  >
                  Hapus
                </button>
                <button
                  @click="typeChar(' ')"
                  class="col-span-4 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-800 dark:text-white font-bold py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-600 text-center shadow-sm active:scale-95 transition-all"
                >
                  Spasi
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Search Button -->
        <button
          @click="performSearch"
          :disabled="isSearching"
          class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
        >
          <span v-if="isSearching" class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          <span v-else class="material-symbols-outlined text-[20px]">search</span>
          {{ isSearching ? 'Mencari...' : 'Cari Kata' }}
        </button>

        <!-- Suggestions/Examples pills inside search card -->
        <div
          class="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800"
        >
          <span
            class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mr-1"
            >Rekomendasi:</span
          >
          <button
            @click="selectWord('nasara')"
            :class="[
              'px-3.5 py-1.5 rounded-full text-xs font-bold font-arabic flex items-center gap-1 border transition-all active:scale-95 shadow-sm',
              currentWordKey === 'nasara'
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                : 'bg-white border-gray-200 text-gray-750 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300',
            ]"
          >
            نصر
          </button>
          <button
            @click="selectWord('khatama')"
            :class="[
              'px-3.5 py-1.5 rounded-full text-xs font-bold font-arabic flex items-center gap-1 border transition-all active:scale-95 shadow-sm',
              currentWordKey === 'khatama'
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                : 'bg-white border-gray-200 text-gray-750 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300',
            ]"
          >
            ختم
          </button>
          <button
            @click="selectWord('kataba')"
            :class="[
              'px-3.5 py-1.5 rounded-full text-xs font-bold font-arabic flex items-center gap-1 border transition-all active:scale-95 shadow-sm',
              currentWordKey === 'kataba'
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                : 'bg-white border-gray-200 text-gray-750 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300',
            ]"
          >
            كتب
          </button>
        </div>
      </div>

      <!-- Custom Tabs -->
      <div
        class="grid grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-3xl border border-gray-200/30 dark:border-gray-700/30"
      >
        <button
          @click="activeTab = 'istilahi'"
          :class="[
            'py-3 px-4 rounded-2xl text-sm font-bold text-center transition-all',
            activeTab === 'istilahi'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50',
          ]"
        >
          Tashrif Istilahi
        </button>
        <button
          @click="activeTab = 'lughowi'"
          :class="[
            'py-3 px-4 rounded-2xl text-sm font-bold text-center transition-all',
            activeTab === 'lughowi'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50',
          ]"
        >
          Tashrif Lughowi
        </button>
      </div>

      <!-- TAB CONTENT: ISTILAHI -->
      <div v-if="activeTab === 'istilahi'" class="space-y-4">
        <!-- 3 columns on desktop/tablets, 2 on mobile -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4" dir="rtl">
          <!-- Cards loop: All boxes restricted to primary blue -->
          <div
            v-for="card in activeWord.istilahi"
            :key="card.title"
            class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:border-primary/50 transition-all flex flex-col items-center justify-between text-center relative overflow-hidden h-[180px] border-t-4 border-t-primary"
          >
            <!-- Card Header -->
            <span
              class="text-[10px] font-extrabold tracking-wider text-gray-400 dark:text-gray-500 uppercase"
            >
              {{ card.title }}
            </span>

            <!-- Arabic Text (Always Blue) -->
            <span
              class="font-arabic text-3xl font-bold my-1 cursor-pointer select-all text-primary dark:text-blue-400"
            >
              {{ card.arabic }}
            </span>

            <!-- Translation -->
            <span
              class="text-xs text-gray-500 dark:text-gray-400 italic font-medium leading-tight"
            >
              {{ card.meaning }}
            </span>

            <!-- Action Link -->
            <button
              @click="viewLughowi(card.id)"
              class="mt-2 text-[10px] font-bold text-primary dark:text-blue-400 hover:underline flex items-center justify-center gap-1 group"
            >
              <span
                class="material-symbols-outlined text-[12px] transition-transform group-hover:translate-x-0.5"
                >arrow_forward</span
              >
              Lihat Tashrif Lughowi
            </button>
          </div>
        </div>
      </div>

      <!-- TAB CONTENT: LUGHOWI -->
      <div v-else class="space-y-4">
        <!-- Form selector for Lughowi -->
        <div
          class="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-2"
        >
          <label
            class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
            >Pilih Bentuk Kata:</label
          >
          <div class="relative">
            <select
              v-model="selectedLughowiForm"
              class="w-full bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
            >
              <option value="madhi">Fi'il Madhi (فعل ماض)</option>
              <option value="mudhari">Fi'il Mudhari (فعل مضارع)</option>
              <option value="fa'il">Isim Fa'il (اسم فاعل)</option>
              <option value="mashdar">Mashdar (مصدر)</option>
              <option value="amr">Fi'il Amr (فعل أمر)</option>
              <option value="maf'ul">Isim Maf'ul (اسم مفعول)</option>
              <option value="zaman_makan">
                Isim Zaman/Makan (اسم زمان/مكان)
              </option>
              <option value="nahi">Fi'il Nahi (فعل نهي)</option>
              <option value="alat">Isim Alat (اسم آلة)</option>
            </select>
          </div>
        </div>

        <!-- Lughowi table for active word & selected form -->
        <div
          class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
        >
          <div
            class="bg-blue-50/50 dark:bg-blue-950/20 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"
          >
            <span
              class="text-xs font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider"
            >
              {{ getFormTitle(selectedLughowiForm) }}
            </span>
            <span
              class="text-xs text-primary dark:text-blue-400 font-bold font-arabic"
            >
              {{ activeWord.arabic }}
            </span>
          </div>

          <div class="divide-y divide-gray-100 dark:divide-gray-800/60">
            <div
              v-for="(row, idx) in activeWord.lughowi[selectedLughowiForm]"
              :key="idx"
              class="p-4 flex items-center justify-between hover:bg-blue-50/10 dark:hover:bg-blue-950/5 transition-colors"
            >
              <!-- Meaning / Pronoun info -->
              <div class="flex flex-col items-start gap-0.5">
                <span
                  class="text-sm font-bold text-gray-800 dark:text-gray-200"
                >
                  {{ getPronounInfo(selectedLughowiForm, idx).pronoun }}
                </span>
                <span
                  class="text-xs text-gray-400 dark:text-gray-500 font-medium"
                >
                  {{ getPronounInfo(selectedLughowiForm, idx).meaning }}
                </span>
              </div>

              <!-- Arabic Conjugated Text (Blue) -->
              <span
                class="font-arabic text-2xl font-extrabold text-primary dark:text-blue-400 tracking-wide"
              >
                {{ typeof row === 'string' ? row : (row.arabic || '') }}
              </span>
            </div>

            <!-- Empty fallback if form not configured -->
            <div
              v-if="
                !activeWord.lughowi[selectedLughowiForm] ||
                activeWord.lughowi[selectedLughowiForm].length === 0
              "
              class="p-8 text-center text-sm text-gray-400 dark:text-gray-500 italic"
            >
              Data lughowi untuk bentuk ini tidak tersedia.
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dir-rtl {
  direction: rtl;
}
</style>
