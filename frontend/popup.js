document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("auth");
  const clipBtn = document.getElementById("clip");
  const dbSelect = document.getElementById("databaseSelect");
  const status = document.getElementById("status");

  let token = null;

  chrome.storage.local.get(
    ["notion_token", "notion_database_id"],
    async (result) => {
      token = result.notion_token;

      if (token) {
        clipBtn.disabled = false;
        status.textContent = "Autenticado ✅";

        const res = await fetch("https://api.notion.com/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({
            filter: {
              property: "object",
              value: "database",
            },
          }),
        });

        const data = await res.json();
        dbSelect.innerHTML = "";

        data.results.forEach((db) => {
          const nameProp = db.title?.[0]?.plain_text || "Sem título";
          const option = document.createElement("option");
          option.value = db.id;
          option.textContent = nameProp;
          dbSelect.appendChild(option);
        });

        if (result.notion_database_id) {
          dbSelect.value = result.notion_database_id;
        }

        dbSelect.onchange = () => {
          chrome.storage.local.set({ notion_database_id: dbSelect.value });
        };
      }
    }
  );

  authBtn.onclick = () => {
    const authUrl = "http://localhost:8000/auth/login/";
    window.open(authUrl, "_blank");
  };

  clipBtn.onclick = async () => {
    const databaseId = dbSelect.value;
    const categoria = document.getElementById("categoria").value.trim();
    const tagsRaw = document.getElementById("tags").value.trim();
    const notas = document.getElementById("notas").value.trim();

    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    if (!databaseId) {
      status.textContent = "Escolha uma database primeiro.";
      return;
    }

    chrome.storage.local.set({ notion_database_id: databaseId });

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const ogImage =
              document.querySelector("meta[property='og:image']")?.content ||
              "";
            const ogDesc =
              document.querySelector("meta[property='og:description']")
                ?.content ||
              document.querySelector("meta[name='description']")?.content ||
              "";
            const favicon =
              document.querySelector("link[rel~='icon']")?.href ||
              "/favicon.ico";
            const content = document.body.innerText.slice(0, 2000); // limita para não ultrapassar o limite

            return {
              title: document.title,
              url: window.location.href,
              ogImage,
              ogDesc,
              favicon,
              content,
            };
          },
        },
        async (results) => {
          const data = results[0].result;

          let pageData = {
            parent: { database_id: databaseId },
            icon: {
              type: "external",
              external: {
                url: data.favicon.startsWith("http")
                  ? data.favicon
                  : new URL(data.favicon, data.url).href,
              },
            },
            cover: data.ogImage
              ? {
                  type: "external",
                  external: { url: data.ogImage },
                }
              : undefined,
            properties: {
              Nome: {
                title: [
                  {
                    text: { content: data.title },
                  },
                ],
              },
              URL: {
                url: data.url,
              },
              Descrição: data.ogDesc
                ? {
                    rich_text: [
                      {
                        text: { content: data.ogDesc },
                      },
                    ],
                  }
                : undefined,
              Categoria: categoria
                ? {
                    select: {
                      name: categoria,
                    },
                  }
                : undefined,
              Tags:
                tags.length > 0
                  ? {
                      multi_select: tags.map((tag) => ({ name: tag })),
                    }
                  : undefined,
              Notas: notas
                ? {
                    rich_text: [
                      {
                        text: { content: notas },
                      },
                    ],
                  }
                : undefined,
            },
            children: [
              {
                object: "block",
                type: "paragraph",
                paragraph: {
                  rich_text: [
                    {
                      type: "text",
                      text: {
                        content: data.content,
                      },
                    },
                  ],
                },
              },
            ],
          };

          // Remove propriedades undefined antes de enviar
          pageData.properties = Object.fromEntries(
            Object.entries(pageData.properties).filter(
              ([, v]) => v !== undefined
            )
          );

          if (!pageData.cover) delete pageData.cover;

          const res = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "Notion-Version": "2022-06-28",
            },
            body: JSON.stringify(pageData),
          });

          if (res.ok) {
            status.textContent = "Página salva com sucesso ✅";
          } else {
            const err = await res.json();
            console.error("Erro ao salvar:", err);
            status.textContent = "Erro ao salvar ❌";
          }
        }
      );
    });
  };
});
