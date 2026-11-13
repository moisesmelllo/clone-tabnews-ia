import { memo, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});

const staticHeader = <h1>🚧 Em Construção</h1>;

const StaticDescription = memo(function StaticDescription({ darkMode }) {
  return (
    <p
      style={{
        maxWidth: "600px",
        fontSize: "1.25rem",
        lineHeight: 1.6,
        margin: "1rem 0 2rem",
        color: darkMode ? "#c9d1d9" : "#24292f",
      }}
    >
      Estamos neste exato momento reconstruindo o TabNews, um lugar na internet
      para quem trabalha com tecnologia e precisa consumir conteudos com valor
      concreto
    </p>
  );
});

const ViewportConfetti = memo(function ViewportConfetti() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    function updateDimensions() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateDimensions();

    window.addEventListener("resize", updateDimensions, { passive: true });
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isComplete]);

  if (isComplete || dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  return (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={400}
      onConfettiComplete={() => setIsComplete(true)}
    />
  );
});

export async function getStaticProps() {
  try {
    const response = await fetch(
      "https://www.tabnews.com.br/api/v1/contents?strategy=new&per_page=1",
    );
    const totalContentsHeader = response.headers.get("x-pagination-total-rows");
    const totalContents = totalContentsHeader
      ? Number(totalContentsHeader)
      : null;

    return {
      props: {
        formattedTotalContents:
          totalContents !== null
            ? totalContents.toLocaleString("pt-BR")
            : "Indisponível no momento",
      },
      revalidate: 60,
    };
  } catch (error) {
    return {
      props: {
        formattedTotalContents: "Indisponível no momento",
      },
      revalidate: 60,
    };
  }
}

function Home({ formattedTotalContents }) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  useEffect(() => {
    document.body.style.cssText = `margin: 0; background-color: ${
      darkMode ? "#0d1117" : "#ffffff"
    }; color: ${
      darkMode ? "#f0f6fc" : "#24292f"
    }; transition: background-color 0.2s ease, color 0.2s ease;`;
  }, [darkMode]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        textAlign: "center",
        padding: "2rem",
        boxSizing: "border-box",
        backgroundColor: darkMode ? "#0d1117" : "#ffffff",
        color: darkMode ? "#f0f6fc" : "#24292f",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      <ViewportConfetti />

      <button
        type="button"
        onClick={toggleDarkMode}
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: `1px solid ${darkMode ? "#30363d" : "#d0d7de"}`,
          backgroundColor: darkMode ? "#21262d" : "#f6f8fa",
          color: darkMode ? "#f0f6fc" : "#24292f",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {darkMode ? "☀️ Desligar tema dark" : "🌙 Ligar tema dark"}
      </button>

      {staticHeader}

      <StaticDescription darkMode={darkMode} />

      <div
        style={{
          padding: "1.25rem 2rem",
          borderRadius: "8px",
          backgroundColor: darkMode ? "#161b22" : "#f6f8fa",
          border: `1px solid ${darkMode ? "#30363d" : "#d0d7de"}`,
          marginBottom: "1.5rem",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <p style={{ margin: 0, fontSize: "1.1rem" }}>
          Total de conteúdos publicados no TabNews:{" "}
          <strong>{formattedTotalContents}</strong>
        </p>
      </div>

      <a
        href="https://www.tabnews.com.br"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: darkMode ? "#58a6ff" : "#0969da",
          fontSize: "1.1rem",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Acessar o site oficial do TabNews &rarr;
      </a>
    </main>
  );
}

export default Home;
