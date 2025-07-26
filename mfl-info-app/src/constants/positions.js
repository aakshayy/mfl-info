// Position attribute weights as percentages
export const positionAttributeWeights = {
  'ST':     { passing: 0.10, shooting: 0.46, defense: 0.00, dribbling: 0.29, pace: 0.10, physical: 0.05, goalkeeping: 0.00 },
  'CF':     { passing: 0.24, shooting: 0.23, defense: 0.00, dribbling: 0.40, pace: 0.13, physical: 0.00, goalkeeping: 0.00 },
  'LW':     { passing: 0.24, shooting: 0.23, defense: 0.00, dribbling: 0.40, pace: 0.13, physical: 0.00, goalkeeping: 0.00 },
  'RW':     { passing: 0.24, shooting: 0.23, defense: 0.00, dribbling: 0.40, pace: 0.13, physical: 0.00, goalkeeping: 0.00 },
  'CAM':    { passing: 0.34, shooting: 0.21, defense: 0.00, dribbling: 0.38, pace: 0.07, physical: 0.00, goalkeeping: 0.00 },
  'CM':     { passing: 0.43, shooting: 0.12, defense: 0.10, dribbling: 0.29, pace: 0.00, physical: 0.06, goalkeeping: 0.00 },
  'LM':     { passing: 0.43, shooting: 0.12, defense: 0.10, dribbling: 0.29, pace: 0.00, physical: 0.06, goalkeeping: 0.00 },
  'RM':     { passing: 0.43, shooting: 0.12, defense: 0.10, dribbling: 0.29, pace: 0.00, physical: 0.06, goalkeeping: 0.00 },
  'CDM':    { passing: 0.28, shooting: 0.00, defense: 0.40, dribbling: 0.17, pace: 0.00, physical: 0.15, goalkeeping: 0.00 },
  'LWB':    { passing: 0.19, shooting: 0.00, defense: 0.44, dribbling: 0.17, pace: 0.10, physical: 0.10, goalkeeping: 0.00 },
  'RWB':    { passing: 0.19, shooting: 0.00, defense: 0.44, dribbling: 0.17, pace: 0.10, physical: 0.10, goalkeeping: 0.00 },
  'LB':     { passing: 0.19, shooting: 0.00, defense: 0.44, dribbling: 0.17, pace: 0.10, physical: 0.10, goalkeeping: 0.00 },
  'RB':     { passing: 0.19, shooting: 0.00, defense: 0.44, dribbling: 0.17, pace: 0.10, physical: 0.10, goalkeeping: 0.00 },
  'CB':     { passing: 0.05, shooting: 0.00, defense: 0.64, dribbling: 0.09, pace: 0.02, physical: 0.20, goalkeeping: 0.00 },
  'GK':     { passing: 0.00, shooting: 0.00, defense: 0.00, dribbling: 0.00, pace: 0.00, physical: 0.00, goalkeeping: 1.00 },
};

// Position order for display purposes
export const positionOrder = ['GK', 'LWB', 'LB', 'CB', 'RB', 'RWB', 'CDM', 'CM', 'RM', 'LM', 'CAM', 'RW', 'LW', 'CF', 'ST'];

// Positional familiarity matrix
// Values: 0 = primary, 1 = secondary/third (-1), 5 = fairly familiar, 8 = somewhat familiar, 20 = unfamiliar
export const familiarityPenalty = {
  GK:   { GK: 0, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 20, CM: 20, CAM: 20, RM: 20, LM: 20, RW: 20, LW: 20, CF: 20, ST: 20 },
  CB:   { GK: 20, CB: 0, RB: 8, LB: 8, RWB: 20, LWB: 20, CDM: 8, CM: 20, CAM: 20, RM: 20, LM: 20, RW: 20, LW: 20, CF: 20, ST: 20 },
  RB:   { GK: 20, CB: 8, RB: 0, LB: 8, RWB: 5, LWB: 20, CDM: 20, CM: 20, CAM: 20, RM: 8, LM: 20, RW: 20, LW: 20, CF: 20, ST: 20 },
  LB:   { GK: 20, CB: 8, RB: 8, LB: 0, RWB: 20, LWB: 5, CDM: 20, CM: 20, CAM: 20, RM: 20, LM: 8, RW: 20, LW: 20, CF: 20, ST: 20 },
  RWB:  { GK: 20, CB: 20, RB: 5, LB: 20, RWB: 0, LWB: 8, CDM: 20, CM: 20, CAM: 20, RM: 8, LM: 20, RW: 8, LW: 20, CF: 20, ST: 20 },
  LWB:  { GK: 20, CB: 20, RB: 20, LB: 5, RWB: 8, LWB: 0, CDM: 20, CM: 20, CAM: 20, RM: 20, LM: 8, RW: 20, LW: 8, CF: 20, ST: 20 },
  CDM:  { GK: 20, CB: 8, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 0, CM: 5, CAM: 8, RM: 20, LM: 20, RW: 20, LW: 20, CF: 20, ST: 20 },
  CM:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 5, CM: 0, CAM: 5, RM: 8, LM: 8, RW: 20, LW: 20, CF: 20, ST: 20 },
  CAM:  { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 8, CM: 5, CAM: 0, RM: 20, LM: 20, RW: 20, LW: 20, CF: 5, ST: 20 },
  RM:   { GK: 20, CB: 20, RB: 8, LB: 20, RWB: 8, LWB: 20, CDM: 20, CM: 8, CAM: 20, RM: 0, LM: 8, RW: 5, LW: 20, CF: 20, ST: 20 },
  LM:   { GK: 20, CB: 20, RB: 20, LB: 8, RWB: 20, LWB: 8, CDM: 20, CM: 8, CAM: 20, RM: 8, LM: 0, RW: 20, LW: 5, CF: 20, ST: 20 },
  RW:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 8, LWB: 20, CDM: 20, CM: 20, CAM: 20, RM: 5, LM: 20, RW: 0, LW: 8, CF: 20, ST: 20 },
  LW:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 8, CDM: 20, CM: 20, CAM: 20, RM: 20, LM: 5, RW: 8, LW: 0, CF: 20, ST: 20 },
  CF:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 20, CM: 20, CAM: 5, RM: 20, LM: 20, RW: 20, LW: 20, CF: 0, ST: 5 },
  ST:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 20, CM: 20, CAM: 8, RM: 20, LM: 20, RW: 20, LW: 20, CF: 5, ST: 0 },
};