import './Footer.css'

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="language-region">
                    <span className="globe-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                    </span>
                    <span className="lang-text">English</span>
                    <span className="flag-us">
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="17" viewBox="0 0 60 30">
                            <rect width="60" height="30" fill="#B22234"/>
                            <rect y="2.31" width="60" height="2.31" fill="#fff"/>
                            <rect y="6.92" width="60" height="2.31" fill="#fff"/>
                            <rect y="11.54" width="60" height="2.31" fill="#fff"/>
                            <rect y="16.15" width="60" height="2.31" fill="#fff"/>
                            <rect y="20.77" width="60" height="2.31" fill="#fff"/>
                            <rect y="25.38" width="60" height="2.31" fill="#fff"/>
                            <rect width="24" height="16.15" fill="#3C3B6E"/>
                        </svg>
                    </span>
                    <span className="region-text">United States</span>
                </div>

                <div className="footer-links">
                    <a href="#">Conditions of Use</a>
                    <a href="#">Privacy Notice</a>
                    <a href="#">Consumer Health Data Privacy Disclosure</a>
                </div>

                <div className="footer-privacy-choices">
                    <a href="#">Your Ads Privacy Choices</a>
                    <span className="privacy-icon">
                        <svg width="30" height="14" viewBox="0 0 30 14" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="0" width="30" height="14" rx="7" fill="#0073BB" />
                            <rect x="1" y="1" width="12" height="12" rx="6" fill="#fff" />
                            <path d="M16 3h7a4 4 0 010 8h-7V3z" fill="#0073BB" />
                            <text x="19.5" y="10" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">✓</text>
                        </svg>
                    </span>
                </div>

                <p className="copyright">© 1996-2026, Amazon.com, Inc. or its affiliates</p>
            </div>
        </footer>
    )
}

export default Footer
