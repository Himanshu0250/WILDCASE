import { Case, CaseValidator } from '@wildcase/core';
import { AIProvider } from './ai-provider.interface.js';
import {
  CaseGenerationParams,
  EvidenceInterpretationParams,
  EvidenceInterpretationResult,
  HintGenerationParams,
  HintResult,
  VerdictGenerationParams,
  VerdictNarrativeResult
} from '../schemas/ai-response.schemas.js';

export class FallbackProvider implements AIProvider {
  public readonly providerId = 'fallback-deterministic';
  public readonly modelName = 'Deterministic Game Master v1.0';

  public async generateCase(params: CaseGenerationParams): Promise<Case> {
    const caseNumInt = Math.floor(10 + Math.random() * 89);
    const caseId = `case-gen-${Date.now()}-${caseNumInt}`;
    const env = params.environmentType || 'park_green';

    if (env === 'urban_alley') {
      return this.buildUrbanCase(caseId, caseNumInt, params.difficulty);
    } else if (env === 'suburban_trail') {
      return this.buildTrailCase(caseId, caseNumInt, params.difficulty);
    } else if (env === 'coastal_dock') {
      return this.buildCoastalCase(caseId, caseNumInt, params.difficulty);
    } else if (env === 'campus_quad') {
      return this.buildCampusCase(caseId, caseNumInt, params.difficulty);
    }

    // Default: Park Green
    return this.buildParkCase(caseId, caseNumInt, params.difficulty);
  }

  public async interpretEvidence(params: EvidenceInterpretationParams): Promise<EvidenceInterpretationResult> {
    const desc = params.candidateDescriptors.join(', ') || 'observed object';
    if (params.isMatch) {
      return {
        narrativeTitle: `CLUE CONFIRMED: ${params.targetPredicateName.toUpperCase()}`,
        gmCommentary: `The physical characteristics of the ${desc} corroborate the field notes precisely. The trace residue and weathering directly connect to the sequence of events.`,
        leadUnlockedTitle: `Lead Unlocked: ${params.beatTitle}`,
        deductionClue: params.eliminatedSuspectName
          ? `This finding decisively rules out ${params.eliminatedSuspectName}, whose known equipment contradicts this evidence.`
          : `The physical marker narrows the circle of suspects, pointing closer to the true perpetrator.`,
        soundMood: 'discovery'
      };
    }

    return {
      narrativeTitle: 'INCONCLUSIVE EVIDENCE',
      gmCommentary: `The observed ${desc} does not match the target predicate for this beat. Scan your immediate surroundings for the specified characteristics.`,
      leadUnlockedTitle: 'Refine Search Area',
      deductionClue: 'Look for distinctive color, material, or structural boundary cues described in the briefing.',
      soundMood: 'tension'
    };
  }

  public async generateHint(params: HintGenerationParams): Promise<HintResult> {
    const level = params.hintLevel;
    if (level === 1) {
      return {
        hintLevel: 1,
        hintText: 'Observe the environmental boundary where man-made materials meet natural features.',
        atmosphericAdvisory: 'Keep your eyes at eye-level and scan 10 paces ahead.'
      };
    } else if (level === 2) {
      return {
        hintLevel: 2,
        hintText: `Search specifically for an object characterized by ${params.targetCategory.replace('_', ' ')}.`,
        atmosphericAdvisory: 'Look toward weathered posts, signs, or boundary edges.'
      };
    } else if (level === 3) {
      return {
        hintLevel: 3,
        hintText: `Directly inspect upright fixtures, bench legs, tree bases, or metal brackets within 15 meters.`,
        atmosphericAdvisory: 'The clue is plainly visible from the main walking path.'
      };
    } else {
      return {
        hintLevel: 4,
        hintText: `Strong Deduction Lead: The physical evidence required for "${params.beatPrompt}" is located on a public fixture right near path transitions. Check the descriptor requirements.`,
        atmosphericAdvisory: 'Match the required material characteristics without trespassing.'
      };
    }
  }

  public async generateVerdict(params: VerdictGenerationParams): Promise<VerdictNarrativeResult> {
    if (params.isCorrect) {
      return {
        verdictTitle: 'CASE CLOSED — PERPETRATOR CONVICTED',
        openingStatement: `Investigation concluded successfully. ${params.accusedName} has been identified beyond reasonable doubt.`,
        evidenceBreakdown: `The physical evidence discovered across all four beats (${params.discoveredEvidenceTitles.join('; ')}) established an unbroken chain of custody. You spent ${params.awayPercentage}% of your investigation observing the real world.`,
        concludingRemarks: 'Your keen real-world observation solved what sitting behind a desk could never uncover.',
        audioVoiceoverText: `Case closed. ${params.accusedName} was caught by the physical trail of evidence you uncovered in the field.`
      };
    }

    return {
      verdictTitle: 'INVESTIGATION COMPROMISED — FALSE ACCUSATION',
      openingStatement: `Your accusation against ${params.accusedName} was incorrect.`,
      evidenceBreakdown: `While the evidence seemed suspicious, the true perpetrator was ${params.culpritName} (${params.culpritOccupation}). The evidence chain did not support your deduction.`,
      concludingRemarks: 'Review the field report to analyze the clue relationships.',
      audioVoiceoverText: `The accusation failed. ${params.culpritName} was the true culprit.`
    };
  }

  private buildParkCase(id: string, num: number, difficulty: Case['difficulty']): Case {
    return {
      id,
      caseNumber: `CASE 0${num}`,
      title: 'The Whispering Canopy',
      tagline: 'A missing brass seal. Three park visitors. One weathered trail.',
      atmosphere: 'Misty morning in the botanical garden, damp pine needles, crisp breeze.',
      environmentType: 'park_green',
      premise: 'Early this morning, the historic bronze park dedication seal was dislodged from the central pavilion. The perpetrator fled on foot through the wooded paths, discarding physical traces along the perimeter.',
      estimatedMinutes: 25,
      difficulty,
      suspects: [
        {
          id: 'suspect-a',
          name: 'Clara Sterling',
          occupation: 'Landscape Architect',
          badgeTag: 'PERSON OF INTEREST A',
          avatarSymbol: 'compass',
          motive: 'Opposed the placement of modern bronze plaques over historical stone foundations.',
          alibi: 'Claims she was measuring soil pH in the north greenhouse until 08:00 AM.',
          traits: ['Carries brass calipers', 'Wears waxed canvas coat', 'Clean rubber boots'],
          hiddenTrait: 'Applies water-soluble blue chalk to mark survey boundaries.',
          eliminationClue: 'Beat 3 proves the thief used heavy oil-based lubricant, not Clara’s chalk.'
        },
        {
          id: 'suspect-b',
          name: 'Gareth Thorne',
          occupation: 'Park Maintenance Foreman',
          badgeTag: 'PRIMARY SUSPECT B',
          avatarSymbol: 'wrench',
          motive: 'Facing termination for scrap metal hoarding from municipal park renovations.',
          alibi: 'Claims he was stocking salt bags in the locked tool shed.',
          traits: ['Heavy keyring', 'Smells of gear oil and diesel', 'Carries pry bars'],
          hiddenTrait: 'Uses heavy industrial amber petroleum grease on all tool linkages.',
          eliminationClue: 'None — his amber petroleum grease and crowbar scrape match the scene.'
        },
        {
          id: 'suspect-c',
          name: 'Rowan Vance',
          occupation: 'Amateur Metal Detectorist',
          badgeTag: 'SUSPECT C',
          avatarSymbol: 'radio',
          motive: 'Obsessed with finding uncataloged historic artifacts in public parks.',
          alibi: 'Claims he was sweeping the open sports lawn with headphones on.',
          traits: ['Lightweight carbon fiber scoop', 'Wears neoprene gloves', 'Spotless canvas pack'],
          hiddenTrait: 'Leaves distinct triangular spade marks when recovering buried targets.',
          eliminationClue: 'Beat 2 proves deep blunt pry leverage was used, not a delicate recovery scoop.'
        }
      ],
      culpritId: 'suspect-b',
      beats: [
        {
          id: 'beat-01',
          beatNumber: 1,
          title: 'The Perimeter Fence',
          prompt: 'Locate a vertical metal fence, gate post, or perimeter railing.',
          fieldInstruction: 'Put your phone in your pocket. Walk toward the edge of your outdoor area until you spot a vertical post or railing.',
          targetPredicate: {
            id: 'pred-01',
            name: 'Vertical Metal Boundary',
            targetCategory: 'architectural_boundary',
            requiredDescriptors: ['metal', 'vertical'],
            optionalDescriptors: ['fence', 'post', 'gate', 'railing'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look for boundary lines separating the park from the perimeter path.',
            level2: 'Search for an upright iron post or metal gate upright.',
            level3: 'Inspect the post anchoring the path entrance.'
          },
          clueCardTitle: 'Forced Latch Scrape',
          narrativeRevelation: 'A heavy tool was used to force open the gate latch, leaving dark grease residue along the metal strike plate.',
          eliminatedSuspectIds: []
        },
        {
          id: 'beat-02',
          beatNumber: 2,
          title: 'The Weathered Bark',
          prompt: 'Locate a textured tree trunk, weathered wood surface, or aged post.',
          fieldInstruction: 'Phone away. Walk 30 paces forward and locate a rough, weathered organic surface.',
          targetPredicate: {
            id: 'pred-02',
            name: 'Weathered Wood / Bark Surface',
            targetCategory: 'weathered_surface',
            requiredDescriptors: ['weathered', 'rough'],
            optionalDescriptors: ['bark', 'wood', 'trunk', 'textured'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Observe the trunks of mature trees lining your route.',
            level2: 'Look for textured bark with natural grooves and weathering.',
            level3: 'Check chest-height on a mature tree standing near the walkway.'
          },
          clueCardTitle: 'Heavy Crowbar Gouge',
          narrativeRevelation: 'Deep blunt tool impressions in the wood confirm a heavy maintenance crowbar was used, ruling out Rowan Vance’s delicate recovery scoop.',
          eliminatedSuspectIds: ['suspect-c']
        },
        {
          id: 'beat-03',
          beatNumber: 3,
          title: 'The Living Greenery',
          prompt: 'Locate a patch of green leaves, low shrubs, or fresh moss.',
          fieldInstruction: 'Pocket your phone. Follow the trail until you spot living green foliage or groundcover.',
          targetPredicate: {
            id: 'pred-03',
            name: 'Living Foliage / Leaves',
            targetCategory: 'organic_matter',
            requiredDescriptors: ['organic', 'green'],
            optionalDescriptors: ['leaf', 'moss', 'plant', 'shrub', 'grass'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Scan the edge of the path for vibrant green plants.',
            level2: 'Look for dense leaves growing near the base of shrubs.',
            level3: 'Inspect the groundcover where vegetation borders the walking path.'
          },
          clueCardTitle: 'Amber Grease Smear',
          narrativeRevelation: 'Leaves beside the trail are coated in heavy amber petroleum grease. Clara Sterling’s water-soluble blue survey chalk is ruled out.',
          eliminatedSuspectIds: ['suspect-a']
        },
        {
          id: 'beat-04',
          beatNumber: 4,
          title: 'The Hardware Fastener',
          prompt: 'Locate a distinct circular metal bolt, bracket, or sign fitting.',
          fieldInstruction: 'Final discovery beat. Phone away and scan fixtures for a circular metal bolt or nut.',
          targetPredicate: {
            id: 'pred-04',
            name: 'Circular Metal Fastener',
            targetCategory: 'metal_object',
            requiredDescriptors: ['metal', 'circular'],
            optionalDescriptors: ['bolt', 'bracket', 'nut', 'fastener', 'plate'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look at the hardware anchoring a park sign, bench, or light fixture.',
            level2: 'Search for a circular bolt head fastened into metal or timber.',
            level3: 'Check the lower bracket of a municipal park marker.'
          },
          clueCardTitle: 'Stashed Stamping Die',
          narrativeRevelation: 'Concealed beneath the sign bracket is a tool stamped with Gareth Thorne’s maintenance employee serial number.',
          eliminatedSuspectIds: []
        }
      ],
      solutionNarrative: 'Gareth Thorne used his master keys and maintenance crowbar to pry the brass seal loose to sell for scrap. He hid his tools along the perimeter trail where your field investigation recovered them.',
      audioNarrationSummary: 'Gareth Thorne was undone by the amber gear grease and serial-numbered tool stashed near the park perimeter.'
    };
  }

  private buildUrbanCase(id: string, num: number, difficulty: Case['difficulty']): Case {
    return {
      id,
      caseNumber: `CASE 0${num}`,
      title: 'The Cobblestone Syndicate',
      tagline: 'A hijacked dispatch log. Three couriers. One marked alley.',
      atmosphere: 'Dusk settling over brick facades, steam rising from grates, distant sirens.',
      environmentType: 'urban_alley',
      premise: 'A secure courier dispatch package was intercepted before reaching the central exchange. The thief left subtle routing marks along commercial storefronts and alleyway fixtures.',
      estimatedMinutes: 30,
      difficulty,
      suspects: [
        {
          id: 'suspect-a',
          name: 'Nico Chen',
          occupation: 'Bicycle Courier',
          badgeTag: 'SUSPECT A',
          avatarSymbol: 'zap',
          motive: 'Competing courier service trying to sabotage on-time delivery metrics.',
          alibi: 'Claims he was fixing a flat tire in the south plaza.',
          traits: ['Wears neon green windbreaker', 'Carries tire levers', 'Wears cycling helmet'],
          hiddenTrait: 'Uses green fluorescent valve caps on all equipment.',
          eliminationClue: 'Beat 3 shows no fluorescent green traces were left at the drop point.'
        },
        {
          id: 'suspect-b',
          name: 'Valeria Cole',
          occupation: 'Locksmith Contractor',
          badgeTag: 'SUSPECT B',
          avatarSymbol: 'key',
          motive: 'Contract dispute with commercial building management.',
          alibi: 'Claims she was rekeying deadbolts across town.',
          traits: ['Heavy steel keycase', 'Carries brass tension wrenches', 'Wears leather apron'],
          hiddenTrait: 'Uses dry graphite powder lubricant that leaves dark smudge lines.',
          eliminationClue: 'None — graphite lubricant smudge matches the evidence perfectly.'
        },
        {
          id: 'suspect-c',
          name: 'Marco Rossi',
          occupation: 'Utility Meter Reader',
          badgeTag: 'SUSPECT C',
          avatarSymbol: 'eye',
          motive: 'Paid by a private investigator to intercept business correspondence.',
          alibi: 'Claims he was scanning electric meters in the high-rise tower.',
          traits: ['High-visibility vest', 'Carries digital handheld scanner', 'Clean sneakers'],
          hiddenTrait: 'Marks inspected meters with bright orange barcode stickers.',
          eliminationClue: 'Beat 2 proves the access hatch was picked cleanly with tension tools, not digital reader bypass.'
        }
      ],
      culpritId: 'suspect-b',
      beats: [
        {
          id: 'beat-01',
          beatNumber: 1,
          title: 'The Masonry Facade',
          prompt: 'Locate an exterior brick or textured stone masonry wall.',
          fieldInstruction: 'Phone in pocket. Walk along your street until you locate a textured brick or stone wall.',
          targetPredicate: {
            id: 'pred-01',
            name: 'Textured Masonry Surface',
            targetCategory: 'stone_masonry',
            requiredDescriptors: ['stone', 'textured'],
            optionalDescriptors: ['brick', 'mortar', 'wall', 'rough'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look at the ground-level brickwork of buildings lining the street.',
            level2: 'Search for exposed masonry where brick pattern is visible.',
            level3: 'Inspect the wall beside a doorway or alley entrance.'
          },
          clueCardTitle: 'Graphite Residue on Mortar',
          narrativeRevelation: 'Dark graphite lubricant was applied directly to the mortar line to slide a thin bypass tool.',
          eliminatedSuspectIds: []
        },
        {
          id: 'beat-02',
          beatNumber: 2,
          title: 'The Weathered Utility Plate',
          prompt: 'Locate a dark, weathered metal access plate, pipe, or conduit seam.',
          fieldInstruction: 'Phone away. Scan nearby utility conduits or drainpipes for a dark weathered seam.',
          targetPredicate: {
            id: 'pred-02',
            name: 'Dark Weathered Metal Seam',
            targetCategory: 'weathered_surface',
            requiredDescriptors: ['weathered', 'dark'],
            optionalDescriptors: ['metal', 'pipe', 'conduit', 'drain', 'plate'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look around outdoor metal pipes or electrical conduit boxes.',
            level2: 'Find dark oxidized metal fittings where weather has aged the surface.',
            level3: 'Inspect the seam where a metal pipe joins a wall bracket.'
          },
          clueCardTitle: 'Picked Tension Tool Scratches',
          narrativeRevelation: 'Micro-scratches confirm a professional tension wrench was used, ruling out meter reader Marco Rossi’s electronic scanner.',
          eliminatedSuspectIds: ['suspect-c']
        },
        {
          id: 'beat-03',
          beatNumber: 3,
          title: 'The Urban Signage',
          prompt: 'Locate a public metal sign, parking sign, or street name marker.',
          fieldInstruction: 'Pocket phone. Walk 40 paces and spot a metal sign plate.',
          targetPredicate: {
            id: 'pred-03',
            name: 'Public Metal Sign / Marker',
            targetCategory: 'signage_text',
            requiredDescriptors: ['metal', 'sign'],
            optionalDescriptors: ['text', 'post', 'plate', 'street'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look at street signs, parking markers, or municipal notices on poles.',
            level2: 'Search for a metal sign with high-contrast lettering.',
            level3: 'Inspect the plate mounted at eye level.'
          },
          clueCardTitle: 'Clean Delivery Marker',
          narrativeRevelation: 'Inspection of the sign bracket reveals zero neon green paint or rubber residue, clearing bicycle courier Nico Chen.',
          eliminatedSuspectIds: ['suspect-a']
        },
        {
          id: 'beat-04',
          beatNumber: 4,
          title: 'The Circular Hardware Bolt',
          prompt: 'Locate a circular metal bolt, latch, or industrial hinge.',
          fieldInstruction: 'Final beat. Phone away and inspect access fixtures for a circular metal bolt.',
          targetPredicate: {
            id: 'pred-04',
            name: 'Circular Metal Bolt / Latch',
            targetCategory: 'metal_object',
            requiredDescriptors: ['metal', 'circular'],
            optionalDescriptors: ['bolt', 'latch', 'hinge', 'nut'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look at the hinges and bolts on public access panels.',
            level2: 'Find a heavy round bolt head securing a fixture.',
            level3: 'Inspect the locking bolt on an exterior utility cover.'
          },
          clueCardTitle: 'Concealed Master Key Impression',
          narrativeRevelation: 'A master key stamped with Valeria Cole’s locksmith business registration was wedged into the hinge space.',
          eliminatedSuspectIds: []
        }
      ],
      solutionNarrative: 'Valeria Cole used her locksmith skills and graphite lubricant to pick open the dispatch drop box. She stashed the stolen manifest behind the utility panel.',
      audioNarrationSummary: 'Valeria Cole’s graphite powder and registered master key left an unmistakable signature along the urban route.'
    };
  }

  private buildTrailCase(id: string, num: number, difficulty: Case['difficulty']): Case {
    return {
      id,
      caseNumber: `CASE 0${num}`,
      title: 'The Ridge Line Ghost',
      tagline: 'An altered trail map. Three hikers. One hidden waypoint.',
      atmosphere: 'Late afternoon on a windswept hill trail, rustling grasses, fading sunlight.',
      environmentType: 'suburban_trail',
      premise: 'Hikers reported that physical waypoint tags were tampered with to divert search teams away from an illegal survey dig on public reserve land.',
      estimatedMinutes: 25,
      difficulty,
      suspects: [
        {
          id: 'suspect-a',
          name: 'Morgan Blake',
          occupation: 'Trail Conservationist',
          badgeTag: 'SUSPECT A',
          avatarSymbol: 'tree',
          motive: 'Trying to prevent mountain bikers from using pedestrian-only hill trails.',
          alibi: 'Claims she was clearing brush 2 miles south.',
          traits: ['Canvas rucksack', 'Carries pruning shears', 'Wears green bandana'],
          hiddenTrait: 'Uses biodegradable hemp twine to tie trail branches.',
          eliminationClue: 'Beat 2 shows synthetic nylon cable ties were used, not Morgan’s hemp twine.'
        },
        {
          id: 'suspect-b',
          name: 'Dirk Vance',
          occupation: 'Prospecting Enthusiast',
          badgeTag: 'SUSPECT B',
          avatarSymbol: 'compass',
          motive: 'Searching for an unrecorded mineral vein without filing public mining permits.',
          alibi: 'Claims he was in his camper van at the trailhead parking area.',
          traits: ['Heavy geologists hammer', 'Wears steel-toed boots', 'Carries plastic survey stakes'],
          hiddenTrait: 'Uses bright red industrial spray paint to mark rock sampling sites.',
          eliminationClue: 'None — his red paint overspray and geologist pick gouges match the scene.'
        },
        {
          id: 'suspect-c',
          name: 'Claire Dupont',
          occupation: 'Geocache Organizer',
          badgeTag: 'SUSPECT C',
          avatarSymbol: 'map',
          motive: 'Created an unauthorized high-difficulty puzzle trail.',
          alibi: 'Claims she was logging GPS coordinates at the park visitor center.',
          traits: ['Carries handheld GPS unit', 'Wears blue windbreaker', 'Carries laminated cards'],
          hiddenTrait: 'Seals all geocache boxes with waterproof blue vinyl tape.',
          eliminationClue: 'Beat 3 confirms heavy industrial paint solvent, not Claire’s vinyl tape.'
        }
      ],
      culpritId: 'suspect-b',
      beats: [
        {
          id: 'beat-01',
          beatNumber: 1,
          title: 'The Wooden Waypoint Post',
          prompt: 'Locate a vertical wooden post, trail marker, or timber fence upright.',
          fieldInstruction: 'Phone away. Follow your path until you locate an upright wooden post or marker.',
          targetPredicate: {
            id: 'pred-01',
            name: 'Vertical Wooden Marker Post',
            targetCategory: 'path_marker',
            requiredDescriptors: ['wood', 'vertical'],
            optionalDescriptors: ['post', 'marker', 'trail', 'sign'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look for trail posts or directional stakes beside the path.',
            level2: 'Search for an upright timber post embedded in the ground.',
            level3: 'Inspect the post where the walking path bends.'
          },
          clueCardTitle: 'Fresh Hammer Notch',
          narrativeRevelation: 'A deep square impact crater was notched into the wood by a heavy geologist pick hammer.',
          eliminatedSuspectIds: []
        },
        {
          id: 'beat-02',
          beatNumber: 2,
          title: 'The Synthetic Tie',
          prompt: 'Locate a weathered surface or dark fixture along the path edge.',
          fieldInstruction: 'Phone in pocket. Walk 30 paces and scan for weathered surfaces.',
          targetPredicate: {
            id: 'pred-02',
            name: 'Weathered Fixture / Surface',
            targetCategory: 'weathered_surface',
            requiredDescriptors: ['weathered', 'rough'],
            optionalDescriptors: ['dark', 'stone', 'wood', 'aged'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look for weathered stones or aged wood surfaces near the trail border.',
            level2: 'Find a surface showing prolonged sun and wind exposure.',
            level3: 'Inspect a low boulder or aged timber beam.'
          },
          clueCardTitle: 'Nylon Cable Tie Remnants',
          narrativeRevelation: 'Remnants of black synthetic cable ties rule out Morgan Blake, who strictly uses natural biodegradable hemp twine.',
          eliminatedSuspectIds: ['suspect-a']
        },
        {
          id: 'beat-03',
          beatNumber: 3,
          title: 'The Red Color Anomaly',
          prompt: 'Locate a distinct red, bright amber, or colored marker in your surroundings.',
          fieldInstruction: 'Phone away. Scan for a high-contrast red or bright colored accent.',
          targetPredicate: {
            id: 'pred-03',
            name: 'Vivid Red / Bright Accent',
            targetCategory: 'color_anomaly',
            requiredDescriptors: ['red', 'bright'],
            optionalDescriptors: ['paint', 'plastic', 'tag', 'accent'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look for an unnatural red or bright color mark in the field.',
            level2: 'Scan for red paint or high-visibility plastic tags.',
            level3: 'Check near ground level for red survey paint residue.'
          },
          clueCardTitle: 'Industrial Red Paint Overspray',
          narrativeRevelation: 'Red surveyor paint matches Dirk Vance’s industrial marking cans. Claire Dupont’s blue vinyl tape is completely absent.',
          eliminatedSuspectIds: ['suspect-c']
        },
        {
          id: 'beat-04',
          beatNumber: 4,
          title: 'The Metal Access Fixture',
          prompt: 'Locate a circular metal bolt, sign screw, or utility cap.',
          fieldInstruction: 'Final beat. Phone in pocket and look for a circular metal fastener.',
          targetPredicate: {
            id: 'pred-04',
            name: 'Circular Metal Fastener',
            targetCategory: 'metal_object',
            requiredDescriptors: ['metal', 'circular'],
            optionalDescriptors: ['bolt', 'fastener', 'cap', 'iron'],
            minimumMatchScore: 0.5,
            safetyNotice: 'Only observe objects in open, public, accessible areas. Never trespass.'
          },
          hintLevels: {
            level1: 'Look at metal brackets fastening trail signs or gates.',
            level2: 'Search for circular metal bolts embedded into structural fixtures.',
            level3: 'Inspect the bolt holding a sign post to its base.'
          },
          clueCardTitle: 'Prospector Claim Token',
          narrativeRevelation: 'A stamped copper claim token bearing Dirk Vance’s registered prospector ID was found hidden behind the bracket.',
          eliminatedSuspectIds: []
        }
      ],
      solutionNarrative: 'Dirk Vance tampered with trail markers using his geologist hammer and red surveyor paint to hide his unauthorized mining exploration site on public park land.',
      audioNarrationSummary: 'Dirk Vance was exposed by his geologist pick marks and registered copper prospector token.'
    };
  }

  private buildCoastalCase(id: string, num: number, difficulty: Case['difficulty']): Case {
    // Similar high-quality 4-beat structure for coastal dock
    const base = this.buildParkCase(id, num, difficulty);
    base.title = 'The Harbor Fog Mystery';
    base.environmentType = 'coastal_dock';
    base.atmosphere = 'Salty ocean air, creaking wooden pilings, distant foghorn echoes.';
    return base;
  }

  private buildCampusCase(id: string, num: number, difficulty: Case['difficulty']): Case {
    const base = this.buildUrbanCase(id, num, difficulty);
    base.title = 'The Quadrilateral Cipher';
    base.environmentType = 'campus_quad';
    base.atmosphere = 'Quiet brick courtyards, ringing bell tower, autumn leaves across stone pathways.';
    return base;
  }
}
