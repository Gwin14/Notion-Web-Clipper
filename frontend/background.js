chrome.runtime.onInstalled.addListener(() => {
  // Menu para seleção de texto
  chrome.contextMenus.create({
    id: "saveSelectionToNotion",
    title: "Salvar seleção no Notion como nota",
    contexts: ["selection"],
  });

  // Menu para clique em imagem
  chrome.contextMenus.create({
    id: "saveImageToNotion",
    title: "Salvar imagem no Notion",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveSelectionToNotion") {
    // Captura o favicon da aba ativa
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => {
          const favicon =
            document.querySelector("link[rel~='icon']")?.href || "/favicon.ico";
          return favicon;
        },
      },
      async (results) => {
        const faviconUrl = results[0].result;

        chrome.storage.local.get(
          ["notion_token", "notion_database_id"],
          async (result) => {
            const token = result.notion_token;
            const databaseId = result.notion_database_id;

            if (!token || !databaseId) {
              console.error("Token ou database não configurado.");
              return;
            }

            const pageData = {
              parent: { database_id: databaseId },
              icon: {
                type: "external",
                external: {
                  url: faviconUrl.startsWith("http")
                    ? faviconUrl
                    : new URL(faviconUrl, info.pageUrl).href,
                },
              },
              properties: {
                Nome: {
                  title: [
                    {
                      text: { content: info.selectionText.slice(0, 50) },
                    },
                  ],
                },
                URL: {
                  url: info.pageUrl,
                },
                Categoria: {
                  select: {
                    name: "Nota",
                  },
                },
                Notas: {
                  rich_text: [
                    {
                      text: { content: info.selectionText },
                    },
                  ],
                },
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
                          content: info.selectionText,
                        },
                      },
                    ],
                  },
                },
              ],
            };

            try {
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
                console.log("Nota salva no Notion com sucesso!");
              } else {
                const err = await res.json();
                console.error("Erro ao salvar nota:", err);
              }
            } catch (e) {
              console.error("Erro de conexão com o Notion:", e);
            }
          }
        );
      }
    );
  }

  if (info.menuItemId === "saveImageToNotion") {
    const imageUrl = info.srcUrl;

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => {
          const favicon =
            document.querySelector("link[rel~='icon']")?.href || "/favicon.ico";
          return favicon;
        },
      },
      async (results) => {
        const faviconUrl = results[0].result;

        chrome.storage.local.get(
          ["notion_token", "notion_database_id"],
          async (result) => {
            const token = result.notion_token;
            const databaseId = result.notion_database_id;

            if (!token || !databaseId) {
              console.error("Token ou database não configurado.");
              return;
            }

            const pageData = {
              parent: { database_id: databaseId },
              icon: {
                type: "external",
                external: {
                  url: faviconUrl.startsWith("http")
                    ? faviconUrl
                    : new URL(faviconUrl, info.pageUrl).href,
                },
              },
              cover: {
                type: "external",
                external: {
                  url: imageUrl,
                },
              },
              properties: {
                Nome: {
                  title: [
                    {
                      text: { content: "Imagem salva" },
                    },
                  ],
                },
                URL: {
                  url: info.pageUrl,
                },
                Categoria: {
                  select: {
                    name: "Imagem",
                  },
                },
                Notas: {
                  rich_text: [
                    {
                      text: { content: "Imagem salva via botão direito." },
                    },
                  ],
                },
              },
              children: [
                {
                  object: "block",
                  type: "image",
                  image: {
                    type: "external",
                    external: {
                      url: imageUrl,
                    },
                  },
                },
              ],
            };

            try {
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
                console.log("Imagem salva no Notion com sucesso!");
              } else {
                const err = await res.json();
                console.error("Erro ao salvar imagem:", err);
              }
            } catch (e) {
              console.error("Erro de conexão com o Notion:", e);
            }
          }
        );
      }
    );
  }
});
