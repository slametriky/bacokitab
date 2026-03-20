CREATE TABLE IF NOT EXISTS public.practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    description TEXT,
    content_data JSONB NOT NULL,
    full_harakat_text JSONB NOT NULL,
    translation_text JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Public read access)
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.practices FOR SELECT USING (true);

-- Insert the example data (we use a specific ID to make it easy to link)
INSERT INTO public.practices (id, title, level, description, content_data, full_harakat_text, translation_text)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'الذَّهَابُ إِلَى السُّوقِ',
    'mubtadi',
    'Pergi ke Pasar',
    '[
  [
    { "type": "potential_question", "id": 14, "word": "هشام", "options": ["هِشَامٌ", "هِشَامًا", "هِشَامٍ"], "answer": "هِشَامٌ" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 1, "word": "يذهب", "options": ["يَذْهَبُ", "يَذْهَبَ", "يَذْهَبِ"], "answer": "يَذْهَبُ" },
    { "type": "text", "content": " مع " },
    { "type": "potential_question", "id": 15, "word": "والده", "options": ["وَالِدِهِ", "وَالِدَهُ", "وَالِدُهُ"], "answer": "وَالِدِهِ" },
    { "type": "text", "content": " إلى " },
    { "type": "potential_question", "id": 2, "word": "السوق", "options": ["السُّوقُ", "السُّوقَ", "السُّوقِ"], "answer": "السُّوقِ" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 16, "word": "مساء", "options": ["مَسَاءَ", "مَسَاءُ", "مَسَاءِ"], "answer": "مَسَاءَ" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 17, "word": "الثلاثاء.", "options": ["الثُّلَاثَاءِ.", "الثُّلَاثَاءَ.", "الثُّلَاثَاءُ."], "answer": "الثُّلَاثَاءِ." },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 18, "word": "هشام", "options": ["هِشَامٌ", "هِشَامًا", "هِشَامٍ"], "answer": "هِشَامٌ" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 3, "word": "يساعد", "options": ["يُسَاعِدُ", "يُسَاعِدَ", "يُسَاعِدِ"], "answer": "يُسَاعِدُ" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 19, "word": "والده", "options": ["وَالِدَهُ", "وَالِدِهِ", "وَالِدُهُ"], "answer": "وَالِدَهُ" },
    { "type": "text", "content": " ويحمل معه " },
    { "type": "potential_question", "id": 4, "word": "الأشياء.", "options": ["الْأَشْيَاءَ.", "الْأَشْيَاءُ.", "الْأَشْيَاءِ."], "answer": "الْأَشْيَاءَ." }
  ],
  [
    { "type": "potential_question", "id": 20, "word": "الوالد", "options": ["الْوَالِدُ", "الْوَالِدَ", "الْوَالِدِ"], "answer": "الْوَالِدُ" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 5, "word": "يأخذ", "options": ["يَأْخُذُ", "يَأْخُذَ", "يَأْخُذِ"], "answer": "يَأْخُذُ" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 21, "word": "معه", "options": ["مَعَهُ", "مَعِهِ", "مَعَاهُ"], "answer": "مَعَهُ" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 22, "word": "حقيبة", "options": ["حَقِيبَةً", "حَقِيبَةٌ", "حَقِيبَةٍ"], "answer": "حَقِيبَةً" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 6, "word": "كبيرة", "options": ["كَبِيرَةً", "كَبِيرَةٌ", "كَبِيرَةٍ"], "answer": "كَبِيرَةً" },
    { "type": "text", "content": " و" },
    { "type": "potential_question", "id": 23, "word": "هشام", "options": ["هِشَامٌ", "هِشَامًا", "هِشَامٍ"], "answer": "هِشَامٌ" },
    { "type": "text", "content": " يأخذ معه حقيبة " },
    { "type": "potential_question", "id": 7, "word": "صغيرة.", "options": ["صَغِيرَةً.", "صَغِيرَةٌ.", "صَغِيرَةٍ."], "answer": "صَغِيرَةً." },
    { "type": "text", "content": " الوالد " },
    { "type": "potential_question", "id": 8, "word": "يشتري", "options": ["يَشْتَرِي", "يَشْتَرَى", "يَشْتَرُوْ"], "answer": "يَشْتَرِي" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 25, "word": "صحيفة", "options": ["صَحِيفَةً", "صَحِيفَةٌ", "صَحِيفَةٍ"], "answer": "صَحِيفَةً" },
    { "type": "text", "content": " و" },
    { "type": "potential_question", "id": 26, "word": "مجلة", "options": ["مَجَلَّةً", "مَجَلَّةٌ", "مَجَلَّةٍ"], "answer": "مَجَلَّةً" },
    { "type": "text", "content": " وزجاجة " },
    { "type": "potential_question", "id": 9, "word": "حبر", "options": ["حِبْرٍ", "حِبْرٌ", "حِبْرًا"], "answer": "حِبْرٍ" },
    { "type": "text", "content": " وهشام يشتري مسطرة وطباشير وعلبة ألوان. " }
  ],
  [
    { "type": "potential_question", "id": 27, "word": "الوالد", "options": ["الْوَالِدُ", "الْوَالِدَ", "الْوَالِدِ"], "answer": "الْوَالِدُ" },
    { "type": "text", "content": " يحمل " },
    { "type": "potential_question", "id": 28, "word": "السكر", "options": ["السُّكَّرَ", "السُّكَّرُ", "السُّكَّرِ"], "answer": "السُّكَّرَ" },
    { "type": "text", "content": " و" },
    { "type": "potential_question", "id": 10, "word": "الدجاج", "options": ["الدَّجَاجَ", "الدَّجَاجُ", "الدَّجَاجِ"], "answer": "الدَّجَاجَ" },
    { "type": "text", "content": " و" },
    { "type": "potential_question", "id": 29, "word": "الزيت", "options": ["الزَّيْتَ", "الزَّيْتُ", "الزَّيْتِ"], "answer": "الزَّيْتَ" },
    { "type": "text", "content": " وهشام يحمل الحلوى والفاكهة و" },
    { "type": "potential_question", "id": 11, "word": "الشاي.", "options": ["الشَّايَ.", "الشَّايُ.", "الشَّايِ."], "answer": "الشَّايَ." },
    { "type": "text", "content": " الوالد يحمل " },
    { "type": "potential_question", "id": 30, "word": "أشياء", "options": ["أَشْيَاءَ", "أَشْيَاءُ", "أَشْيَاءِ"], "answer": "أَشْيَاءَ" },
    { "type": "text", "content": " " },
    { "type": "potential_question", "id": 12, "word": "كثيرة", "options": ["كَثِيرَةً", "كَثِيرَةٌ", "كَثِيرَةٍ"], "answer": "كَثِيرَةً" },
    { "type": "text", "content": " وهشام يحمل أشياء " },
    { "type": "potential_question", "id": 13, "word": "كثيرة.", "options": ["كَثِيرَةً.", "كَثِيرَةٌ.", "كَثِيرَةٍ."], "answer": "كَثِيرَةً." }
  ]
]',
    '["هِشَامٌ يَذْهَبُ مَعَ وَالِدِهِ إِلَى السُّوقِ مَسَاءَ الثُّلَاثَاءِ. هِشَامٌ يُسَاعِدُ وَالِدَهُ وَيَحْمِلُ مَعَهُ الْأَشْيَاءَ.", "الْوَالِدُ يَأْخُذُ مَعَهُ حَقِيبَةً كَبِيرَةً وَهِشَامٌ يَأْخُذُ مَعَهُ حَقِيبَةً صَغِيرَةً. الْوَالِدُ يَشْتَرِي صَحِيفَةً وَمَجَلَّةً وَزُجَاجَةَ حِبْرٍ وَهِشَامٌ يَشْتَرِي مِسْطَرَةً وَطَبَاشِيرَ وَعُلْبَةَ أَلْوَانٍ.", "الْوَالِدُ يَحْمِلُ السُّكَّرَ وَالدَّجَاجَ وَالزَّيْتَ وَهِشَامٌ يَحْمِلُ الْحَلْوَى وَالْفَاكِهَةَ وَالشَّايَ. الْوَالِدُ يَحْمِلُ أَشْيَاءَ كَثِيرَةً وَهِشَامٌ يَحْمِلُ أَشْيَاءَ كَثِيرَةً."]',
    '["Hisyam pergi bersama ayahnya ke pasar pada Selasa sore. Hisyam membantu ayahnya dan membawakan barang-barang bersamanya.", "Sang Ayah membawa bersamanya sebuah tas besar dan Hisyam membawa bersamanya tas kecil. Sang Ayah membeli koran, majalah, dan sebotol tinta, dan Hisyam membeli penggaris, kapur tulis, dan sekotak pewarna.", "Sang ayah membawa gula, ayam, dan minyak, sedangkan Hisyam membawa manisan, buah-buahan, dan teh. Sang Ayah membawakan banyak barang dan Hisyam membawakan banyak barang."]'
) ON CONFLICT (id) DO UPDATE SET 
    content_data = EXCLUDED.content_data,
    full_harakat_text = EXCLUDED.full_harakat_text,
    translation_text = EXCLUDED.translation_text;
