import { NextResponse } from 'next/server';

// Fake API data for freelancer profile
const profileData = {
  personal: {
    name: "Alex Chen",
    title: "Full-Stack Blockchain Developer",
    description: "Passionate blockchain developer with 5+ years of experience in DeFi protocols and smart contract development.",
    about: "I specialize in building scalable blockchain solutions, from smart contracts to full-stack dApps. My expertise spans across Ethereum, Solana, and Internet Computer Protocol, with a strong focus on DeFi and NFT marketplaces. I believe in writing clean, secure code that delivers exceptional user experiences.",
    profileImage: "/api/placeholder/400/400",
    socials: [
      { platform: "GitHub", url: "https://github.com", icon: "github" },
      { platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
      { platform: "Twitter", url: "https://twitter.com", icon: "twitter" },
      { platform: "Portfolio", url: "https://portfolio.com", icon: "globe" }
    ]
  },
  skills: [
    "Solidity", "React", "TypeScript", "Node.js", "Web3.js", "Ethers.js", 
    "Smart Contracts", "DeFi", "NFTs", "IPFS", "GraphQL", "PostgreSQL",
    "Docker", "AWS", "Rust", "Internet Computer", "Motoko", "Python"
  ],
  stats: {
    companiesServed: 45,
    projectsDone: 127,
    hackathonsParticipated: 23
  },
  workExperience: [
    {
      id: 1,
      designation: "Senior Blockchain Developer",
      company: "DeFi Labs",
      description: "Led development of multi-chain DeFi protocol, implementing yield farming and liquidity mining features. Managed a team of 6 developers and delivered $50M+ TVL platform.",
      duration: "2023 - Present",
      timeWorked: "2 years"
    },
    {
      id: 2,
      designation: "Smart Contract Developer",
      company: "NFT Marketplace Inc",
      description: "Developed and audited smart contracts for NFT marketplace, implementing royalty systems and auction mechanisms. Reduced gas costs by 40% through optimization.",
      duration: "2021 - 2023",
      timeWorked: "2 years"
    },
    {
      id: 3,
      designation: "Full-Stack Developer",
      company: "Crypto Startup",
      description: "Built end-to-end cryptocurrency trading platform with real-time data feeds and automated trading bots. Handled 10M+ transactions daily.",
      duration: "2020 - 2021",
      timeWorked: "1 year"
    }
  ],
  services: [
    {
      id: 1,
      title: "Smart Contract Development",
      image: "/api/placeholder/300/200",
      personName: "Alex Chen",
      description: "Custom smart contracts for DeFi, NFTs, and DAOs with security audits and gas optimization.",
      rating: 4.9,
      price: "500 ICP"
    },
    {
      id: 2,
      title: "DeFi Protocol Development",
      image: "/api/placeholder/300/200",
      personName: "Alex Chen",
      description: "End-to-end DeFi protocol development including yield farming, staking, and liquidity pools.",
      rating: 4.8,
      price: "1200 ICP"
    },
    {
      id: 3,
      title: "dApp Frontend Development",
      image: "/api/placeholder/300/200",
      personName: "Alex Chen",
      description: "Modern Web3 frontend applications with wallet integration and responsive design.",
      rating: 4.9,
      price: "800 ICP"
    },
    {
      id: 4,
      title: "Blockchain Consulting",
      image: "/api/placeholder/300/200",
      personName: "Alex Chen",
      description: "Technical consulting for blockchain architecture, tokenomics, and security best practices.",
      rating: 5.0,
      price: "300 ICP"
    }
  ],
  reviews: [
    {
      id: 1,
      text: "Alex delivered an exceptional smart contract solution that exceeded our expectations. The code quality was outstanding and the project was completed ahead of schedule.",
      reviewer: "Sarah Johnson",
      designation: "CTO, DeFi Innovations"
    },
    {
      id: 2,
      text: "Working with Alex was a game-changer for our project. His expertise in blockchain development and attention to detail resulted in a flawless NFT marketplace.",
      reviewer: "Michael Rodriguez",
      designation: "Founder, ArtChain"
    },
    {
      id: 3,
      text: "Alex's deep understanding of DeFi protocols helped us launch our yield farming platform successfully. Highly recommended for complex blockchain projects.",
      reviewer: "Emily Davis",
      designation: "Product Manager, YieldMax"
    }
  ],
  portfolio: [
    {
      id: 1,
      title: "DeFi Yield Farming Platform",
      image: "/api/placeholder/300/200",
      description: "Multi-chain yield farming platform with automated compounding and risk management features."
    },
    {
      id: 2,
      title: "NFT Marketplace",
      image: "/api/placeholder/300/200",
      description: "Comprehensive NFT marketplace with auction system, royalties, and batch minting capabilities."
    },
    {
      id: 3,
      title: "DAO Governance Platform",
      image: "/api/placeholder/300/200",
      description: "Decentralized governance platform with proposal creation, voting mechanisms, and treasury management."
    },
    {
      id: 4,
      title: "Cross-Chain Bridge",
      image: "/api/placeholder/300/200",
      description: "Secure cross-chain bridge enabling asset transfers between Ethereum and Polygon networks."
    },
    {
      id: 5,
      title: "Staking Protocol",
      image: "/api/placeholder/300/200",
      description: "Flexible staking protocol with multiple reward mechanisms and penalty systems."
    }
  ]
};

export async function GET() {
  try {
    return NextResponse.json({ ok: true, data: profileData });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
