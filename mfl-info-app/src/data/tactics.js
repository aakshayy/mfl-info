// Football tactics with their position requirements
const tacticsRaw = [
  '3-4-2-1: GK CB CB CB LM CM CM RM CF CF ST',
  '3-4-3: GK CB CB CB LM CM CM RM LW RW ST',
  '3-4-3 (diamond): GK CB CB CB CDM LM RM CAM LW RW ST',
  '3-5-2: GK CB CB CB CM CDM CM LM RM ST ST',
  '3-5-2 (B): GK CB CB CB CDM CDM LM RM CAM ST ST',
  '4-1-2-1-2: GK LB CB CB RB CDM LM RM CAM ST ST',
  '4-1-2-1-2 (narrow): GK LB CB CB RB CDM CM CM CAM ST ST',
  '4-1-3-2: GK LB CB CB RB CDM LM CM RM ST ST',
  '4-1-4-1: GK LB CB CB RB CDM LM CM CM RM ST',
  '4-2-2-2: GK LB CB CB RB CDM CDM CAM CAM ST ST',
  '4-2-3-1: GK LB CB CB RB CDM CDM LM RM CAM ST',
  '4-2-4: GK LB CB CB RB CM CM LW RW ST ST',
  '4-3-1-2: GK LB CB CB RB CM CM CM CAM ST ST',
  '4-3-2-1: GK LB CB CB RB CM CM CM CF CF ST',
  '4-3-3: GK LB CB CB RB CM CM CM LW RW ST',
  '4-3-3 (att): GK LB CB CB RB CM CM CAM LW RW ST',
  '4-3-3 (def): GK LB CB CB RB CDM CM CM LW RW ST',
  '4-3-3 (false 9): GK LB CB CB RB CDM CM CM LW RW CF',
  '4-4-1-1: GK LB CB CB RB LM CM CM RM CF ST',
  '4-4-2: GK LB CB CB RB LM CM CM RM ST ST',
  '4-4-2 (B): GK LB CB CB RB CDM CDM LM RM ST ST',
  '5-2-3: GK LWB CB CB CB RWB CM CM LW RW ST',
  '5-3-2: GK LWB CB CB CB RWB LM CM RM ST ST',
  '5-4-1: GK LWB CB CB CB RWB CDM LM RM CAM ST',
  '5-4-1 (flat): GK LWB CB CB CB RWB LM CM CM RM ST',
];

export const tactics = tacticsRaw.map(line => {
  const [name, posStr] = line.split(':');
  return { 
    name: name.trim(), 
    positions: posStr.trim().split(/\s+/) 
  };
});