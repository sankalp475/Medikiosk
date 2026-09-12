import { useState } from "react";
import { RadioGroup, Radio, Label, Description } from "@headlessui/react";

const languages = [
  { id: "en", name: "English", native: "English", flag: "🇬🇧" },
  { id: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { id: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
];

export default function LanguageSelector({ onSelect }) {
  const [selected, setSelected] = useState(null);

  function handleChange(lang) {
    setSelected(lang);
    onSelect?.(lang);
  }

  return (
    <RadioGroup
      value={selected}
      onChange={handleChange}
      className="language-radio-group"
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <Radio
          key={lang.id}
          value={lang}
          className="language-radio-card"
          id={`language-option-${lang.id}`}
        >
          <span className="lang-flag">{lang.flag}</span>
          <Label className="lang-name">{lang.name}</Label>
          <Description className="lang-native">{lang.native}</Description>
        </Radio>
      ))}
    </RadioGroup>
  );
}
