---
name: flowbite-vue
description: >-
  Panduan dan best practices untuk membangun UI di Vue 3 menggunakan Flowbite-Vue dan Flowbite Tailwind di BacoKitab.
  Gunakan skill ini saat membuat, mengedit, atau menata komponen antarmuka (UI) seperti modal, form/input, tombol, alert, tabel, dropdown, toast, dll.
---

# Flowbite-Vue UI Guide for BacoKitab

Proyek ini menggunakan **Vue 3 (Composition API `<script setup>`)**, **Tailwind CSS 3**, dan pustaka UI **Flowbite-Vue** (`flowbite-vue` + `flowbite/plugin`).

---

## 1. Konvensi Import & Penamaan Komponen

Semua komponen Flowbite-Vue menggunakan prefix **`Fwb`** dan diimpor langsung via named import:

```vue
<script setup>
import {
  FwbButton,
  FwbModal,
  FwbAlert,
  FwbBadge,
  FwbCard,
  FwbDropdown,
  FwbInput,
  FwbTextarea,
  FwbSelect,
  FwbCheckbox,
  FwbRadio,
  FwbToggle,
  FwbTable,
  FwbTableHead,
  FwbTableBody,
  FwbTableRow,
  FwbTableCell,
  FwbSpinner,
  FwbToast,
  FwbAccordion,
  FwbAccordionPanel,
  FwbAccordionHeader,
  FwbAccordionContent,
  FwbTabs,
  FwbTab
} from 'flowbite-vue';
</script>
```

---

## 2. Pola Implementasi Komponen Utama

### A. Modal (`FwbModal`)

```vue
<script setup>
import { ref } from 'vue';
import { FwbButton, FwbModal } from 'flowbite-vue';

const isShowModal = ref(false);

const closeModal = () => {
  isShowModal.value = false;
};
</script>

<template>
  <FwbButton @click="isShowModal = true">Buka Modal</FwbButton>

  <FwbModal v-if="isShowModal" @close="closeModal" size="md">
    <template #header>
      <div class="flex items-center text-lg font-bold text-gray-900 dark:text-white">
        Judul Modal
      </div>
    </template>
    <template #body>
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        Konten isi modal di sini...
      </p>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <FwbButton @click="closeModal" color="alternative">Batal</FwbButton>
        <FwbButton @click="closeModal" color="default">Simpan</FwbButton>
      </div>
    </template>
  </FwbModal>
</template>
```

### B. Tombol (`FwbButton`)

- **Warna (`color`)**: `default` (sesuai primary), `alternative`, `light`, `green`, `red`, `yellow`, `purple`.
- **Ukuran (`size`)**: `xs`, `sm`, `md`, `lg`, `xl`.
- **Variasi**: `outline`, `pill`, `gradient`.

```vue
<FwbButton color="default" size="md">Simpan</FwbButton>
<FwbButton color="alternative" outline>Batal</FwbButton>
<FwbButton color="green">
  <span class="material-symbols-outlined text-sm mr-1">check</span>
  Selesai
</FwbButton>
```

### C. Input & Form (`FwbInput`, `FwbTextarea`, `FwbSelect`, `FwbToggle`)

```vue
<script setup>
import { ref } from 'vue';
import { FwbInput, FwbTextarea, FwbToggle, FwbSelect } from 'flowbite-vue';

const textInput = ref('');
const noteInput = ref('');
const isEnabled = ref(false);
const selectedLevel = ref('mubtadi');

const levels = [
  { value: 'mubtadi', name: 'Mubtadi\' (Pemula)' },
  { value: 'mutawassit', name: 'Mutawassith (Menengah)' },
  { value: 'mutaqaddim', name: 'Mutaqaddim (Mahir)' }
];
</script>

<template>
  <div class="space-y-4">
    <FwbInput
      v-model="textInput"
      placeholder="Masukkan kata..."
      label="Kata Kunci"
      size="md"
    />

    <FwbTextarea
      v-model="noteInput"
      :rows="4"
      placeholder="Tuliskan catatan analisis..."
      label="Catatan"
    />

    <FwbSelect
      v-model="selectedLevel"
      :options="levels"
      label="Tingkat Pembelajaran"
    />

    <FwbToggle v-model="isEnabled" label="Mode Ringkas" />
  </div>
</template>
```

### D. Alert & Toast (`FwbAlert`, `FwbToast`)

- **Tipe (`type`)**: `info`, `danger`, `success`, `warning`, `dark`.

```vue
<!-- Notifikasi / Alert Inline -->
<FwbAlert type="info" closable icon>
  Silakan klik kata Arab untuk melihat rincian i'rab secara detail.
</FwbAlert>

<!-- Floating Toast -->
<FwbToast v-if="showSuccessToast" type="success" closable @close="showSuccessToast = false">
  Data berhasil disimpan ke riwayat.
</FwbToast>
```

### E. Tabel Data (`FwbTable`)

```vue
<FwbTable hoverable striped>
  <FwbTableHead>
    <FwbTableHeadCell>Kata</FwbTableHeadCell>
    <FwbTableHeadCell>Kedudukan (I'rab)</FwbTableHeadCell>
    <FwbTableHeadCell>Tanda</FwbTableHeadCell>
    <FwbTableHeadCell><span class="sr-only">Aksi</span></FwbTableHeadCell>
  </FwbTableHead>
  <FwbTableBody>
    <FwbTableRow v-for="item in items" :key="item.id">
      <FwbTableCell class="font-arabic text-lg">{{ item.word }}</FwbTableCell>
      <FwbTableCell>{{ item.position }}</FwbTableCell>
      <FwbTableCell>{{ item.sign }}</FwbTableCell>
      <FwbTableCell>
        <FwbButton size="xs" color="light" @click="viewDetail(item)">Detail</FwbButton>
      </FwbTableCell>
    </FwbTableRow>
  </FwbTableBody>
</FwbTable>
```

### F. Accordion (`FwbAccordion`)

Sangat cocok untuk daftar kaidah Nahwu, FAQ, atau ringkasan bab:

```vue
<FwbAccordion>
  <FwbAccordionPanel>
    <FwbAccordionHeader>Apa itu I'rab Rafa'?</FwbAccordionHeader>
    <FwbAccordionContent>
      <p class="text-gray-600 dark:text-gray-300">
        Rafa' memiliki 4 tanda: Dhammah, Wawu, Alif, dan Nun...
      </p>
    </FwbAccordionContent>
  </FwbAccordionPanel>
</FwbAccordion>
```

---

## 3. Integrasi Khusus dengan BacoKitab

1. **Dark Mode**:
   - `darkMode: 'class'` sudah aktif di Tailwind.
   - Komponen Flowbite-Vue otomatis mendukung mode gelap jika parent memiliki class `dark`.
2. **Teks Arab & Font Amiri**:
   - Gunakan class `font-arabic` atau `arabic-text` serta atribut `dir="rtl"` atau `dir="auto"` ketika menampilkan teks berbahasa Arab.
3. **Ikon**:
   - Proyek menggunakan Google Material Symbols (`<span class="material-symbols-outlined">icon_name</span>`).
   - Masukkan tag ini ke dalam slot tombol/komponen Flowbite secara langsung.
4. **Warna Tema**:
   - Warna `primary` telah diatur ke varian biru (Tailwind default `2563eb`).
   - Background tema: `bg-background-light` (`#f6f8f7`) dan `bg-background-dark` (`#10172a`).

