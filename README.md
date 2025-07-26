# mfl-info

**mfl-info** is a React web application that provides an analysis and visualization tool for MFL (likely a football/soccer manager game) club information.

## Key Features
- **Player Analysis**: Fetches and displays detailed player information including stats, positions, and ratings
- **Position Rating System**: Calculates position-specific ratings based on weighted attributes for different football positions
- **Tactical Analysis**: Shows optimal lineups for various football formations (25+ tactics supported)
- **Interactive Interface**: Sortable player tables with dual-tab view (Players/Tactics)

## Technical Stack
- **Framework**: React 18.3.1 with Create React App
- **Deployment**: GitHub Pages (hosted at `https://aakshayy.github.io/mfl-info`)
- **API Integration**: AWS Lambda backend for player data
- **Styling**: CSS with custom components

## Core Functionality
1. **Data Fetching**: Retrieves player data from AWS API based on club ID
2. **Position Calculations**: Uses sophisticated weighting system for 15 different positions (GK, CB, LB, RB, etc.)
3. **Tactical Optimization**: Implements backtracking algorithm to find optimal player assignments for formations
4. **Performance Metrics**: Shows team averages and top player statistics

The app is designed for football manager game enthusiasts to analyze their team composition and find optimal tactical setups.