import React, { useRef, useState } from "react";

const MAX_SIZE = 50 * 1024 * 1024;

function App() {
  const inputRef = useRef(null);

  const [activeTool, setActiveTool] = useState("home");

  const [parts, setParts] = useState([]);
  const [source, setSource] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [dpLoading, setDpLoading] = useState(false);
  const [dpError, setDpError] = useState("");

  const selectTool = (tool) => {
    setActiveTool(tool);
    setError("");
    setDpError("");
  };

  const processFile = (file) => {
    setError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Image size must be 50 MB or less.");
      return;
    }

    setProcessing(true);
    setParts([]);
    setSource(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        requestAnimationFrame(() => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;

          const cellWidth = width / 2;
          const cellHeight = height / 3;

          const result = [];

          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
              const sx = Math.round(col * cellWidth);
              const sy = Math.round(row * cellHeight);

              const ex =
                col === 1
                  ? width
                  : Math.round((col + 1) * cellWidth);

              const ey =
                row === 2
                  ? height
                  : Math.round((row + 1) * cellHeight);

              const canvas = document.createElement("canvas");

              canvas.width = ex - sx;
              canvas.height = ey - sy;

              const ctx = canvas.getContext("2d", {
                alpha: false,
              });

              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";

              ctx.drawImage(
                img,
                sx,
                sy,
                ex - sx,
                ey - sy,
                0,
                0,
                canvas.width,
                canvas.height
              );

              result.push({
                id: row * 2 + col + 1,
                src: canvas.toDataURL("image/jpeg", 0.96),
              });
            }
          }

          setParts(result);
          setProcessing(false);
        });
      };

      img.onerror = () => {
        setError("Unable to process this image.");
        setProcessing(false);
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      setError("Unable to read this file.");
      setProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const download = (src, id) => {
    const link = document.createElement("a");

    link.href = src;
    link.download = `catalog-${id}.jpg`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadAll = async () => {
    for (const part of parts) {
      download(part.src, part.id);

      await new Promise((resolve) =>
        setTimeout(resolve, 450)
      );
    }
  };

  const reset = () => {
    setParts([]);
    setSource(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const getWhatsAppDP = () => {
    setDpError("");
    setProfilePic("");

    const cleanNumber = phone.replace(/\D/g, "");

    if (!cleanNumber) {
      setDpError("Enter a WhatsApp number.");
      return;
    }

    if (cleanNumber.length < 8) {
      setDpError("Please enter a valid phone number.");
      return;
    }

    setDpLoading(true);

    const apiUrl =
      `https://unavatar.io/whatsapp/${cleanNumber}`;

    const tempImg = new Image();

    tempImg.onload = () => {
      setProfilePic(apiUrl);
      setDpLoading(false);
    };

    tempImg.onerror = () => {
      setDpLoading(false);
      setDpError(
        "Profile picture could not be found."
      );
    };

    tempImg.src = apiUrl;
  };

  const downloadDP = async () => {
    if (!profilePic) return;

    try {
      const response = await fetch(profilePic);

      if (!response.ok) {
        throw new Error();
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        `whatsapp-dp-${phone.replace(/\D/g, "")}.jpg`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch {
      window.open(profilePic, "_blank");
    }
  };

  return (
    <main className="page">
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <section className="shell">

        <nav className="nav">
          <div className="brand">
            <span>DARK TECH</span>
            <span className="muted">ZONE</span>
          </div>
        </nav>

        {activeTool === "home" && (
          <section className="home">

            <div className="homeBadge">
              <span />
              DARK TECH ZONE • ONLINE
            </div>

            <h1>
              Everything you need,
              <span>in one dark zone.</span>
            </h1>

            <p className="homeText">
              Simple, fast and powerful web tools
              designed to make everyday tasks easier.
            </p>

            <button
              className="exploreButton"
              onClick={() => setActiveTool("catalog")}
            >
              Explore Tools
              <span>→</span>
            </button>

            <div className="homeVisual">

              <div className="orbit orbitOne" />
              <div className="orbit orbitTwo" />

              <div className="core">
                <div className="coreIcon">
                  D
                </div>

                <span>
                  DARK TECH
                </span>
              </div>

              <div className="floatingCard cardOne">
                <span>✂</span>

                <div>
                  <strong>
                    Catalog Cutter
                  </strong>

                  <small>
                    2 × 3 Image Split
                  </small>
                </div>
              </div>

              <div className="floatingCard cardTwo">
                <span>◉</span>

                <div>
                  <strong>
                    WhatsApp DP
                  </strong>

                  <small>
                    Profile Tool
                  </small>
                </div>
              </div>

            </div>

            <div className="homeTools">

              <div className="homeSectionTitle">
                <span>AVAILABLE TOOLS</span>

                <small>
                  Choose what you need
                </small>
              </div>

              <div className="toolCards">

                <button
                  className="toolCard"
                  onClick={() =>
                    selectTool("catalog")
                  }
                >
                  <div className="toolCardIcon">
                    ✂
                  </div>

                  <div className="toolCardContent">
                    <span>01</span>

                    <h3>
                      Catalog Cutter
                    </h3>

                    <p>
                      Split one image into
                      six perfect pieces.
                    </p>
                  </div>

                  <b>→</b>
                </button>

                <button
                  className="toolCard"
                  onClick={() =>
                    selectTool("whatsapp")
                  }
                >
                  <div className="toolCardIcon">
                    ◉
                  </div>

                  <div className="toolCardContent">
                    <span>02</span>

                    <h3>
                      WhatsApp DP
                    </h3>

                    <p>
                      Check an available
                      WhatsApp profile picture.
                    </p>
                  </div>

                  <b>→</b>
                </button>

              </div>
            </div>

            <div className="homeFeatures">

              <div>
                <span>⚡</span>

                <strong>Fast</strong>

                <small>
                  Instant tools
                </small>
              </div>

              <div>
                <span>◈</span>

                <strong>Simple</strong>

                <small>
                  Easy interface
                </small>
              </div>

              <div>
                <span>✦</span>

                <strong>Modern</strong>

                <small>
                  Dark tech design
                </small>
              </div>

            </div>

          </section>
        )}

        {activeTool === "catalog" && (
          <section className="toolView">

            <div className="toolHeading">
              <span>TOOL 01</span>

              <h2>
                Catalog Cutter
              </h2>

              <p>
                Split one image into six
                clean 2 × 3 catalog pieces.
              </p>
            </div>

            {!parts.length ? (

              <div
                className={`dropzone ${
                  dragging ? "active" : ""
                }`}
                onClick={() =>
                  !processing &&
                  inputRef.current?.click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() =>
                  setDragging(false)
                }
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);

                  processFile(
                    e.dataTransfer.files?.[0]
                  );
                }}
              >

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) =>
                    processFile(
                      e.target.files?.[0]
                    )
                  }
                  hidden
                />

                <div className="dropIconWrap">
                  <div className="dropIcon">
                    ↑
                  </div>
                </div>

                <h2>
                  {processing
                    ? "Processing image..."
                    : "Drop your image here"}
                </h2>

                <p>
                  {processing
                    ? "Creating six high-quality pieces"
                    : "or click to browse from your device"}
                </p>

                <div className="formatRow">
                  <span>JPG</span>
                  <span>PNG</span>
                  <span>WEBP</span>
                  <span>UP TO 50 MB</span>
                </div>

                {processing && (
                  <div className="progress">
                    <i />
                  </div>
                )}

              </div>

            ) : (

              <section className="workspace">

                <div className="workspaceTop">

                  <div>

                    <div className="successLine">
                      <span>✓</span>
                      Image split successfully
                    </div>

                    <h2>
                      {source?.name ||
                        "Your image"}
                    </h2>

                  </div>

                  <div className="toolbar">

                    <button
                      className="secondary"
                      onClick={reset}
                    >
                      New image
                    </button>

                    <button
                      className="primary"
                      onClick={downloadAll}
                    >
                      Download all
                    </button>

                  </div>

                </div>

                <div className="grid">

                  {parts.map(
                    (part, index) => (

                      <article
                        className="piece"
                        key={part.id}
                        style={{
                          "--delay":
                            `${index * 70}ms`,
                        }}
                      >

                        <div className="pieceImage">

                          <img
                            src={part.src}
                            alt=""
                          />

                          <div className="pieceNumber">
                            {String(
                              part.id
                            ).padStart(2, "0")}
                          </div>

                        </div>

                        <div className="pieceFooter">

                          <div>

                            <strong>
                              Piece {part.id}
                            </strong>

                            <span>
                              Catalog sequence
                            </span>

                          </div>

                          <button
                            onClick={() =>
                              download(
                                part.src,
                                part.id
                              )
                            }
                          >
                            ↓
                          </button>

                        </div>

                      </article>

                    )
                  )}

                </div>

              </section>

            )}

          </section>
        )}

        {activeTool === "whatsapp" && (
          <section className="toolView">

            <div className="toolHeading">

              <span>TOOL 02</span>

              <h2>
                WhatsApp DP
              </h2>

              <p>
                Enter a WhatsApp number with
                its country code to check for
                an available profile picture.
              </p>

            </div>

            <div className="dpBox">

              <div className="phoneInput">

                <span className="plus">
                  +
                </span>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      getWhatsAppDP();
                    }
                  }}
                  placeholder="94771234567"
                  inputMode="numeric"
                />

                <button
                  className="primary"
                  onClick={getWhatsAppDP}
                  disabled={dpLoading}
                >
                  {dpLoading
                    ? "Checking..."
                    : "Find DP"}
                </button>

              </div>

              {dpLoading && (
                <div className="dpLoader">

                  <div className="spinner" />

                  <span>
                    Searching profile picture...
                  </span>

                </div>
              )}

              {dpError && (
                <div className="error">
                  ! {dpError}
                </div>
              )}

              {profilePic &&
                !dpLoading && (

                  <div className="dpResult">

                    <div className="dpImageWrap">

                      <img
                        src={profilePic}
                        alt=""
                      />

                    </div>

                    <div className="dpDetails">

                      <div className="successLine">
                        <span>✓</span>
                        PROFILE FOUND
                      </div>

                      <h3>
                        +{phone.replace(
                          /\D/g,
                          ""
                        )}
                      </h3>

                      <p>
                        Available profile picture
                      </p>

                      <button
                        className="primary"
                        onClick={downloadDP}
                      >
                        ↓ Download DP
                      </button>

                    </div>

                  </div>

                )}

            </div>

          </section>
        )}

        {activeTool === "bots" && (
          <section className="emptyView">
            <div className="emptyIcon">◉</div>
            <span>BOTS</span>
            <h2>Bots</h2>
            <p>
              Bot tools will be available here.
            </p>
          </section>
        )}

        {activeTool === "ai" && (
          <section className="emptyView">
            <div className="emptyIcon">✦</div>
            <span>AI</span>
            <h2>AI Tools</h2>
            <p>
              AI tools will be available here.
            </p>
          </section>
        )}

        {error && (
          <div className="error">
            ! {error}
          </div>
        )}

        <footer>
          <span>DARK TECH ZONE</span>

          <span>
            Smart tools. Simple results.
          </span>
        </footer>

      </section>

      <nav className="bottomNav">

        <button
          className={
            activeTool === "home"
              ? "active"
              : ""
          }
          onClick={() =>
            selectTool("home")
          }
        >
          <span>⌂</span>
          <small>Home</small>
        </button>

        <button
          className={
            activeTool === "catalog" ||
            activeTool === "whatsapp"
              ? "active"
              : ""
          }
          onClick={() =>
            selectTool("catalog")
          }
        >
          <span>⚒</span>
          <small>Tools</small>
        </button>

        <button
          className={
            activeTool === "bots"
              ? "active"
              : ""
          }
          onClick={() =>
            selectTool("bots")
          }
        >
          <span>◉</span>
          <small>Bots</small>
        </button>

        <button
          className={
            activeTool === "ai"
              ? "active"
              : ""
          }
          onClick={() =>
            selectTool("ai")
          }
        >
          <span>✦</span>
          <small>AI</small>
        </button>

      </nav>

    </main>
  );
}

export default App;
