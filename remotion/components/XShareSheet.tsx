import React, { useState, useCallback } from 'react';

interface ShareSheetProps {
  sheetTranslateY: number;
  backdropOpacity: number;
  onShareClick?: () => void;
  shareButtonTapped?: boolean;
  tapIndicatorOpacity?: number;
}

const VerifiedBadge = ({ style }: { style?: React.CSSProperties }) => (
  <img
    src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/1ebefc33-a788-46bb-8214-f4933b8643b1.png"
    alt="Verified"
    style={{
      width: '17.1px',
      height: '17.1px',
      position: 'relative',
      objectFit: 'cover',
      ...style
    }}
  />
);

const SeparatorDot = () => (
  <div
    style={{
      width: '2.6px',
      height: '2.6px',
      backgroundColor: '#7C7C7C',
      borderRadius: '50%',
      flexShrink: 0
    }}
  />
);

interface ActionButtonProps {
  icon: string;
  count: string;
  alt: string;
  onClick?: () => void;
}

const ActionButton = ({ icon, count, alt, onClick }: ActionButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '2.2px',
        cursor: 'pointer',
        transition: 'opacity 0.2s ease',
        opacity: isHovered ? 0.7 : 1,
        outline: 'none'
      }}
      aria-label={`${alt} ${count}`}
    >
      <img
        src={icon}
        alt={alt}
        style={{
          width: '22.9px',
          height: '22.9px',
          overflow: 'hidden'
        }}
      />
      <span
        style={{
          color: '#6D6D6D',
          fontSize: '15.3px',
          fontFamily: '"Inter", sans-serif',
          fontWeight: 400,
          lineHeight: '18.5px'
        }}
      >
        {count}
      </span>
    </button>
  );
};

const Divider = ({ width = '467px', margin = '0' }: { width?: string; margin?: string }) => (
  <div
    style={{
      width,
      height: '1.16px',
      display: 'flex',
      padding: `0 27.88px`,
      boxSizing: 'border-box',
      margin
    }}
  >
    <div
      style={{
        height: '1.16px',
        borderColor: 'rgba(26, 26, 26, 1)',
        borderStyle: 'solid',
        mixBlendMode: 'color-dodge',
        borderTopWidth: '1.16px',
        borderRightWidth: '0px',
        borderBottomWidth: '0px',
        borderLeftWidth: '0px',
        width: '100%'
      }}
    />
  </div>
);

const AppIcon = ({ src, name }: { src: string; name: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      style={{
        width: '90.61px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '9.29px',
        background: 'none',
        border: 'none',
        padding: '0 0 2.32px 0',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        outline: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={src}
        alt={name}
        style={{
          width: '81.32px',
          height: '81.32px',
          borderRadius: '17.42px',
          objectFit: 'cover'
        }}
      />
      <span
        style={{
          color: 'white',
          fontSize: '12.8px',
          fontFamily: '"SF Pro", sans-serif',
          textAlign: 'center'
        }}
      >
        {name}
      </span>
    </button>
  );
};

const ActionIcon = ({ symbol, name }: { symbol: string; name: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      style={{
        width: '90.61px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8.13px',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        outline: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          width: '81.32px',
          height: '81.32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isHovered ? 'rgba(40, 40, 40, 1)' : 'rgba(18, 18, 18, 1)',
          mixBlendMode: 'color-dodge',
          borderRadius: '50%',
          transition: 'background-color 0.2s'
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: '29px',
            fontFamily: '"SF Pro", sans-serif'
          }}
        >
          {symbol}
        </span>
      </div>
      <span
        style={{
          color: 'white',
          fontSize: '15.1px',
          fontFamily: '"SF Pro", sans-serif',
          textAlign: 'center',
          lineHeight: '17.4px',
          letterSpacing: '-0.12px'
        }}
      >
        {name}
      </span>
    </button>
  );
};

export const XShareSheet: React.FC<ShareSheetProps> = ({
  sheetTranslateY,
  backdropOpacity,
  onShareClick,
  shareButtonTapped = false,
  tapIndicatorOpacity = 0
}) => {
  const handleAction = (type: string) => {
    console.log(`${type} clicked`);
  };

  const handleCloseSheet = useCallback(() => {
    console.log('Close sheet clicked');
  }, []);

  const isSheetVisible = sheetTranslateY < 600;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '501px',
        height: '1024px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        margin: '0 auto',
        backgroundColor: '#000'
      }}
    >
      {/* Background Layers */}
      <img
        src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/c74a14b9-613b-4396-8653-7c848a83eac4.png"
        alt=""
        style={{
          width: '501px',
          height: '1024px',
          opacity: 0.7,
          position: 'absolute',
          left: 0,
          top: 0,
          objectFit: 'cover',
          pointerEvents: 'none'
        }}
      />
      <img
        src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/4e207dd1-152c-40fc-87a1-39d01d584554.png"
        alt="iPhone Frame"
        style={{
          width: '501px',
          height: '1024px',
          position: 'absolute',
          left: 0,
          top: 0,
          objectFit: 'cover',
          pointerEvents: 'none'
        }}
      />

      {/* iOS Accessibility-style Tap Indicator */}
      {tapIndicatorOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: '401px',
            top: '492px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            opacity: tapIndicatorOpacity,
            pointerEvents: 'none',
            zIndex: 20,
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)'
          }}
        />
      )}

      {/* Backdrop Dim Overlay */}
      {isSheetVisible && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            opacity: backdropOpacity,
            pointerEvents: isSheetVisible ? 'auto' : 'none',
            zIndex: 5
          }}
        />
      )}

      {/* Main Content Area */}
      <main
        style={{
          width: '458px',
          height: '988.25px',
          position: 'absolute',
          left: '20px',
          top: '17.5px'
        }}
      >
        <img
          src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/d717edd4-6abd-47b8-9d28-ece8de7b1764.png"
          alt=""
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            objectFit: 'cover'
          }}
        />

        {/* Header UI */}
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            position: 'absolute',
            left: '209px',
            top: '70px'
          }}
          onClick={() => handleAction('Logo')}
        >
          <img
            src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/065582a0-ea32-42c0-942f-557f82b30472.svg"
            alt="X Logo"
            style={{
              width: '40px',
              height: '37.5px'
            }}
          />
        </button>

        {/* Post 1: Dan Koe */}
        <article
          style={{
            position: 'absolute',
            left: '14px',
            top: '133.5px',
            width: '429px'
          }}
        >
          <img
            src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/c8bcf498-fdaf-4232-b7cc-946d7e90560a.svg"
            alt="Dan Koe"
            style={{
              width: '48px',
              height: '48px',
              position: 'absolute',
              left: 0,
              top: '2.3px',
              borderRadius: '50%'
            }}
          />

          <button
            style={{
              position: 'absolute',
              right: '10px',
              top: '9px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/b92a0ad5-5737-45fb-ba7b-269d40317f60.svg"
              alt="More"
              style={{
                width: '3px',
                height: '14px'
              }}
            />
          </button>

          <section
            style={{
              marginLeft: '59px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '370px'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span
                style={{
                  color: '#FFF',
                  fontSize: '19.7px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700
                }}
              >
                Dan Koe
              </span>
              <VerifiedBadge />
              <span
                style={{
                  color: '#7C7C7C',
                  fontSize: '19.7px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 300
                }}
              >
                @thedankoe
              </span>
              <SeparatorDot />
              <span
                style={{
                  color: '#7C7C7C',
                  fontSize: '19.7px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 300
                }}
              >
                10h
              </span>
            </div>

            <div
              style={{
                width: '100%',
                border: '0.2px solid #6D6D6D',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <img
                src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/d7b4e06d-425c-43d6-a847-576a9d0bc05f.png"
                alt="Focus Guide"
                style={{
                  width: '100%',
                  height: '145.6px',
                  objectFit: 'cover',
                  borderBottom: '1px solid #000'
                }}
              />
              <div
                style={{
                  padding: '8px 5px',
                  color: '#FFF',
                  fontSize: '18.7px',
                  fontFamily: '"Inclusive Sans", sans-serif',
                  lineHeight: '23.6px',
                  whiteSpace: 'pre-line'
                }}
              >
                {`Full guide: how to unlock extreme focus on command\nYou haven't experienced anything near what you're capable of.\nAnd if you learn how to unlock that power you can do what most people`}
              </div>
            </div>

            <nav
              style={{
                display: 'flex',
                flexDirection: 'row',
                padding: '10px 0 15px',
                gap: '23px',
                alignItems: 'center'
              }}
            >
              <ActionButton
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/6bc0f1ca-fde2-41ac-bcc9-abfe2c87ab21.svg"
                count="13.1k"
                alt="Comments"
                onClick={() => handleAction('Reply')}
              />
              <ActionButton
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/bd5c5a17-1246-4bee-9d51-3bdb3f25ea4f.svg"
                count="11.2k"
                alt="Retweets"
                onClick={() => handleAction('Retweet')}
              />
              <ActionButton
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/6d4f568a-11f7-4efc-8a30-790aa4b54fad.svg"
                count="41K"
                alt="Likes"
                onClick={() => handleAction('Like')}
              />
              <ActionButton
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/857542a7-3d48-43c9-b9d8-795438c4af81.svg"
                count="10M"
                alt="Views"
                onClick={() => handleAction('View')}
              />
              <button
                id="share-button-target"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  position: 'relative',
                  transform: shareButtonTapped ? 'scale(0.9)' : 'scale(1)',
                  transition: 'transform 0.15s ease-out'
                }}
                onClick={() => {
                  handleAction('Share');
                  onShareClick?.();
                }}
              >
                {/* Blue pulse animation around button */}
                {shareButtonTapped && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(29, 155, 240, 0.25)',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 0
                    }}
                  />
                )}
                <img
                  src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/66e27d12-52fa-42ee-b209-4f7b8a4f2ac4.svg"
                  alt="Share"
                  style={{
                    width: '19.9px',
                    height: '19.9px',
                    position: 'relative',
                    zIndex: 1
                  }}
                />
              </button>
            </nav>
          </section>
        </article>

        {/* Dividers */}
        <div
          style={{
            width: '454px',
            height: '1px',
            backgroundColor: '#6D6D6D',
            position: 'absolute',
            left: '4px',
            top: '540.5px'
          }}
        />
        <div
          style={{
            width: '454px',
            height: '1px',
            backgroundColor: '#6D6D6D',
            position: 'absolute',
            left: '4px',
            top: '935.5px'
          }}
        />

        {/* Post 2: Elisha Long */}
        <article
          style={{
            position: 'absolute',
            left: '12px',
            top: '541.5px',
            width: '432px'
          }}
        >
          <img
            src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/f5aea21b-bec7-4f39-8e8d-c367c50a3b99.svg"
            alt="Elisha Long"
            style={{
              width: '48px',
              height: '48px',
              position: 'absolute',
              left: 0,
              top: '0.3px',
              borderRadius: '50%'
            }}
          />

          <section
            style={{
              marginLeft: '63px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '369px'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span
                style={{
                  color: '#FFF',
                  fontSize: '19.7px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700
                }}
              >
                Elisha Long
              </span>
              <VerifiedBadge />
              <span
                style={{
                  color: '#7C7C7C',
                  fontSize: '19.7px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 300
                }}
              >
                @ElishaDLong
              </span>
              <SeparatorDot />
              <span
                style={{
                  color: '#7C7C7C',
                  fontSize: '19.7px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 300
                }}
              >
                22h
              </span>
            </div>

            <div
              style={{
                width: '100%',
                border: '0.2px solid #6D6D6D',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <img
                src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/ae5dcd6f-a7d3-46fb-b224-518f25324c5d.jpg"
                alt="Warhammer Quote"
                style={{
                  width: '100%',
                  height: '147px',
                  objectFit: 'cover',
                  borderBottom: '1px solid #000'
                }}
              />
              <div
                style={{
                  padding: '8px 10px',
                  color: '#FFF',
                  fontSize: '18.7px',
                  fontFamily: '"Inclusive Sans", sans-serif',
                  lineHeight: '23.6px',
                  whiteSpace: 'pre-line'
                }}
              >
                {`Be Retarded To Win At Life\n"Blessed is the mind too small for doubt"\n-Warhammer 40k\nFuck The Science, Fuck The Facts, Retardmaxx Retardmaxx your friend group. Do a 360° and...`}
              </div>
            </div>

            <nav
              style={{
                display: 'flex',
                flexDirection: 'row',
                padding: '10px 0 15px',
                gap: '23px',
                alignItems: 'center'
              }}
            >
              <ActionButton
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/582340c8-910e-4934-85d0-4b571be0c740.svg"
                count="607"
                alt="Comments"
                onClick={() => handleAction('Reply')}
              />
              <ActionButton
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/d9efd106-89df-44cb-aaed-4465c375f941.svg"
                count="2.3K"
                alt="Retweets"
                onClick={() => handleAction('Retweet')}
              />
              <ActionButton
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/5e53817d-ec71-49f1-ba00-54e67904bd78.svg"
                count="16K"
                alt="Likes"
                onClick={() => handleAction('Like')}
              />
              <ActionButton
                icon="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/4591475a-79ba-4fc8-bae5-cfeec00f5524.svg"
                count="4.3M"
                alt="Views"
                onClick={() => handleAction('View')}
              />
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                onClick={() => handleAction('Share')}
              >
                <img
                  src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/023af052-5f1a-4232-92ea-31abdb18bae5.svg"
                  alt="Share"
                  style={{
                    width: '19.9px',
                    height: '19.9px'
                  }}
                />
              </button>
            </nav>
          </section>
        </article>
      </main>

      {/* Share Sheet Overlay */}
      <div
        className="activity-view-iphone"
        style={{
          width: '467px',
          height: '618px',
          position: 'absolute',
          left: '17px',
          bottom: '18px',
          borderRadius: '38px 38px 0 0',
          overflow: 'hidden',
          backgroundColor: 'rgba(28, 28, 30, 1)',
          boxShadow: '0px 17px 87px rgba(0, 0, 0, 0.18)',
          zIndex: 10,
          transform: `translateY(${sheetTranslateY}px)`,
          pointerEvents: isSheetVisible ? 'auto' : 'none'
        }}
      >
        {/* Grabber */}
        <div
          style={{
            width: '41.8px',
            height: '5.8px',
            backgroundColor: 'rgba(235, 235, 245, 0.3)',
            borderRadius: '3px',
            margin: '6px auto'
          }}
        />

        {/* Header */}
        <header
          style={{
            display: 'flex',
            padding: '12px 18.6px',
            alignItems: 'center',
            gap: '18.6px'
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/ed6726a4-f179-4b1b-9c90-575c07770373.jpg"
              alt="Profile"
              style={{
                width: '74.3px',
                height: '74.3px',
                borderRadius: '18.6px',
                border: '0.6px solid rgba(0,0,0,0.15)',
                boxShadow: '0px 2.3px 18.6px rgba(0,0,0,0.15)'
              }}
            />
          </div>
          <div style={{ flexGrow: 1 }}>
            <h1
              style={{
                color: 'white',
                fontSize: '17.4px',
                fontWeight: 510,
                fontFamily: 'SF Pro',
                margin: 0,
                mixBlendMode: 'color-dodge'
              }}
            >
              DAN KOE (@thedankoe)
            </h1>
            <p
              style={{
                color: 'rgba(153, 153, 153, 1)',
                fontSize: '15.1px',
                fontFamily: 'SF Pro',
                margin: '2px 0 0 0',
                mixBlendMode: 'color-dodge'
              }}
            >
              41K likes • 13.1k replies
            </p>
          </div>
          <button
            onClick={handleCloseSheet}
            style={{
              width: '51px',
              height: '51px',
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              padding: 0
            }}
          >
            <img
              src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/Close%20Button.png"
              alt="Close"
              style={{
                width: '51px',
                height: '51px'
              }}
            />
          </button>
        </header>

        <Divider />

        {/* Contacts Row */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            padding: '16.3px 0 18.6px 27.9px',
            gap: '16.3px',
            scrollbarWidth: 'none'
          }}
        >
          {[
            {
              first: 'Herland',
              last: 'Antezana',
              img: '039e6136-268b-4719-a71e-c3afa974db24.png'
            },
            {
              first: 'Rigo',
              last: 'Rangel',
              img: '12841fa7-8dc0-4671-976a-c2862ef614f0.png'
            },
            {
              first: 'Magico',
              last: 'and El...',
              isGroup: true
            },
            {
              first: 'Jenny',
              last: 'Court',
              img: '2ebd329b-abb2-4776-b538-8767ff970882.png'
            },
            {
              first: 'Alejandra',
              last: 'Delgado',
              img: 'df4a9e82-815c-40aa-857a-24f9f7c0dd5d.png'
            }
          ].map((contact, i) => (
            <button
              key={i}
              style={{
                width: '90.6px',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '81.3px',
                  height: '81.3px',
                  margin: '0 auto'
                }}
              >
                {contact.isGroup ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(120, 120, 128, 0.32)',
                      borderRadius: '50%'
                    }}
                  >
                    <img
                      src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/aa625c7c-a604-494f-87d1-3720fa0a8af2.png"
                      alt=""
                      style={{
                        width: '43.4px',
                        height: '43.4px',
                        position: 'absolute',
                        left: '10.5px',
                        top: '10.5px',
                        borderRadius: '50%'
                      }}
                    />
                    <img
                      src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/af2e61a6-ff15-45e1-9948-8b8d4d949b76.png"
                      alt=""
                      style={{
                        width: '25.6px',
                        height: '25.6px',
                        position: 'absolute',
                        right: '10.5px',
                        bottom: '10.5px',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                ) : (
                  <img
                    src={`https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/${contact.img}`}
                    alt={contact.first}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <img
                  src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/5b80a7c0-663d-4006-af46-44b17fb4142c.png"
                  alt=""
                  style={{
                    width: '23.2px',
                    height: '23.2px',
                    position: 'absolute',
                    right: '-5px',
                    bottom: '0px',
                    borderRadius: '6px'
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: '5.8px',
                  color: 'white',
                  fontSize: '13.9px',
                  fontFamily: 'SF Pro',
                  textAlign: 'center'
                }}
              >
                {contact.first}
                <br />
                {contact.last}
              </div>
            </button>
          ))}
        </div>

        <Divider />

        {/* App row */}
        <div
          style={{
            display: 'flex',
            padding: '20.9px 0 23.2px 27.9px',
            gap: '16.3px',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          <AppIcon
            name="AirDrop"
            src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/20785430-4a42-4bb5-9a28-965a3e03b337.png"
          />
          <AppIcon
            name="Messages"
            src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/60a2e3e5-1f46-4cc5-a92b-a18618fea933.png"
          />
          <AppIcon
            name="Speed Read"
            src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/9db773fc-6786-4c7e-a649-a940349ef88f.png"
          />
          <AppIcon
            name="Notes"
            src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/b5ae6c67-de40-406d-be0b-72891d3dc432.png"
          />
          <AppIcon
            name="Reminders"
            src="https://storage.googleapis.com/storage.magicpath.ai/user/367107014540816384/figma-assets/f8b6ab99-d50a-456e-ac6a-e01050f970b7.png"
          />
        </div>

        <Divider />

        {/* Actions row */}
        <div
          style={{
            display: 'flex',
            padding: '16.3px 0 23.2px 27.9px',
            gap: '16.3px',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          <ActionIcon symbol="􀉁" name="Copy" />
          <ActionIcon symbol="􀋂" name="Add to Favorites" />
          <ActionIcon symbol="􀖆" name="Add to Reading List" />
          <ActionIcon symbol="􀉚" name="Add Bookmark" />
        </div>
      </div>
    </div>
  );
};
