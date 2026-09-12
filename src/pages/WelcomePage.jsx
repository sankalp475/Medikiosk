import { useState } from "react";
import { Heading, Text, Button, Flex, Box } from "@radix-ui/themes";
import LanguageSelector from "../components/LanguageSelector";

const greetings = {
  en: {
    hello: "Hello there! 👋",
    subtitle: "We're here to help you get your medicines quickly and easily.",
    cta: "Let's get started →",
  },
  hi: {
    hello: "नमस्ते! 👋",
    subtitle: "हम आपकी दवाइयाँ जल्दी और आसानी से दिलाने में मदद करते हैं।",
    cta: "चलिए शुरू करते हैं →",
  },
  ml: {
    hello: "നമസ്കാരം! 👋",
    subtitle: "നിങ്ങളുടെ മരുന്നുകൾ വേഗത്തിലും എളുപ്പത്തിലും ലഭിക്കാൻ ഞങ്ങൾ ഇവിടെയുണ്ട്.",
    cta: "നമുക്ക് തുടങ്ങാം →",
  },
};

export default function WelcomePage() {
  const [language, setLanguage] = useState(null);

  const t = language ? greetings[language.id] : greetings.en;

  function handleContinue() {
    if (!language) return;
    console.log("Continuing with language:", language.id);
  }

  return (
    <div className="welcome-page">
      {/* ─── Timeline Top Bar ─── */}
      <header className="timeline-bar" id="timeline-bar">
        <div className="timeline-brand">
          <span className="timeline-logo-icon">💊</span>
          <div className="timeline-brand-text">
            <span className="timeline-brand-name">
              Medi<span className="timeline-brand-accent">Kiosk</span>
            </span>
            <span className="timeline-tagline">Healthcare at your fingertips</span>
          </div>
        </div>

        <nav className="timeline-steps" aria-label="Progress">
          <div className="timeline-step timeline-step--active">
            <span className="timeline-dot">1</span>
            <span className="timeline-step-label">Language</span>
          </div>
          <div className="timeline-connector" />
          <div className="timeline-step">
            <span className="timeline-dot">2</span>
            <span className="timeline-step-label">Details</span>
          </div>
          <div className="timeline-connector" />
          <div className="timeline-step">
            <span className="timeline-dot">3</span>
            <span className="timeline-step-label">Services</span>
          </div>
        </nav>
      </header>

      {/* Decorative background blobs */}
      <div className="welcome-blob welcome-blob--1" aria-hidden="true" />
      <div className="welcome-blob welcome-blob--2" aria-hidden="true" />
      <div className="welcome-blob welcome-blob--3" aria-hidden="true" />

      <Flex
        direction="column"
        align="center"
        justify="center"
        className="welcome-container"
      >
        {/* Friendly wave illustration */}
        <Box className="welcome-illustration" id="welcome-illustration">
          <span className="welcome-wave" aria-hidden="true">🏥</span>
        </Box>

        {/* Friendly greeting */}
        <Heading
          size="7"
          weight="bold"
          className="welcome-hello"
          as="h1"
          id="welcome-title"
        >
          {t.hello}
        </Heading>

        <Text size="3" className="welcome-subtitle" id="welcome-subtitle">
          {t.subtitle}
        </Text>

        {/* Divider */}
        <div className="welcome-divider" aria-hidden="true" />

        {/* Language selector */}
        <Box className="welcome-selector-wrapper">
          <Text size="2" className="welcome-label" as="label">
            Which language do you prefer?
          </Text>
          <LanguageSelector onSelect={setLanguage} />
        </Box>

        {/* Continue */}
        <Button
          size="3"
          className="welcome-cta"
          id="welcome-continue-btn"
          disabled={!language}
          onClick={handleContinue}
          mt="5"
        >
          {t.cta}
        </Button>

        {/* Helper text */}
        <Text size="1" className="welcome-helper" mt="3">
          You can change this later in settings
        </Text>
      </Flex>
    </div>
  );
}
