export const INGREDIENT_DATASET_META = Object.freeze({
  "schemaVersion": 1,
  "datasetVersion": "1.0.0",
  "total": 220,
  "qualityModel": "supplier_batch_1_to_5",
  "priceModel": "fallback_per_game_unit",
  "note": "basePurchasePrice is fallback unit price; reality snapshots may override it."
});

export const INGREDIENTS_V1 = Object.freeze(
[
  {
    "schemaVersion": 1,
    "id": "pork",
    "name": "猪肉",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.024,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_belly",
    "name": "五花肉",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.032,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_tenderloin",
    "name": "猪里脊",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.038,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_ribs",
    "name": "猪肋排",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.035,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_shoulder",
    "name": "梅花肉",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.03,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_leg",
    "name": "猪后腿肉",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.027,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_liver",
    "name": "猪肝",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 1,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_intestine",
    "name": "猪大肠",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.024,
    "shelfLifeDays": 1,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_trotter",
    "name": "猪蹄",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.022,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef",
    "name": "牛肉",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.065,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_brisket",
    "name": "牛腩",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.058,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_tenderloin",
    "name": "牛里脊",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.11,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_shank",
    "name": "牛腱",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.055,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_tripe",
    "name": "牛肚",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.045,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lamb",
    "name": "羊肉",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.07,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lamb_leg",
    "name": "羊腿肉",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.065,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lamb_rack",
    "name": "羊排",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.095,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mutton_roll",
    "name": "羊肉卷",
    "category": "meat",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.075,
    "shelfLifeDays": 4,
    "edibleRate": 0.9,
    "baseWasteRate": 0.08,
    "procurementGroup": "fresh_meat",
    "allergenTags": [],
    "culinaryTags": [
      "meat"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken",
    "name": "鸡肉",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.02,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_breast",
    "name": "鸡胸肉",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.024,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_thigh",
    "name": "鸡腿肉",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.022,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_wing",
    "name": "鸡翅",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.03,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_feet",
    "name": "鸡爪",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.023,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "duck",
    "name": "鸭肉",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.024,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "duck_breast",
    "name": "鸭胸",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.038,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "duck_leg",
    "name": "鸭腿",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.032,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "goose",
    "name": "鹅肉",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.045,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pigeon",
    "name": "乳鸽",
    "category": "poultry",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 4,
    "edibleRate": 0.88,
    "baseWasteRate": 0.08,
    "procurementGroup": "poultry",
    "allergenTags": [],
    "culinaryTags": [
      "poultry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grass_carp",
    "name": "草鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "common_carp",
    "name": "鲤鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.02,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "crucian_carp",
    "name": "鲫鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.022,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sea_bass",
    "name": "鲈鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.048,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mandarin_fish",
    "name": "鳜鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.085,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "snakehead",
    "name": "黑鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.036,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tilapia",
    "name": "罗非鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.02,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "yellow_croaker",
    "name": "黄花鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.055,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "hairtail",
    "name": "带鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.05,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pomfret",
    "name": "鲳鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "salmon",
    "name": "三文鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.095,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tuna",
    "name": "金枪鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.09,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp",
    "name": "白虾",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.05,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "shellfish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "river_shrimp",
    "name": "河虾",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "shellfish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "prawn",
    "name": "基围虾",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.07,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "shellfish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "crayfish",
    "name": "小龙虾",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.042,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "shellfish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "crab",
    "name": "梭子蟹",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.075,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "shellfish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mitten_crab",
    "name": "大闸蟹",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.12,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "shellfish"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "scallop",
    "name": "扇贝",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.055,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "mollusk"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "oyster",
    "name": "生蚝",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.035,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "mollusk"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "clam",
    "name": "花蛤",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "mollusk"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "razor_clam",
    "name": "蛏子",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.028,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "mollusk"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mussel",
    "name": "青口贝",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.025,
    "shelfLifeDays": 1,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "mollusk"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "squid",
    "name": "鱿鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.045,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "mollusk"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cuttlefish",
    "name": "墨鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.05,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "mollusk"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "octopus",
    "name": "章鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 2,
    "edibleRate": 0.65,
    "baseWasteRate": 0.16,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "mollusk"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sea_cucumber",
    "name": "海参",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.18,
    "shelfLifeDays": 2,
    "edibleRate": 0.8,
    "baseWasteRate": 0.08,
    "procurementGroup": "aquatic",
    "allergenTags": [],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "abalone",
    "name": "鲍鱼",
    "category": "seafood",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.22,
    "shelfLifeDays": 2,
    "edibleRate": 0.45,
    "baseWasteRate": 0.2,
    "procurementGroup": "aquatic",
    "allergenTags": [
      "mollusk"
    ],
    "culinaryTags": [
      "seafood"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "napa_cabbage",
    "name": "大白菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.004,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cabbage",
    "name": "圆白菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.005,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bok_choy",
    "name": "小白菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.007,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spinach",
    "name": "菠菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lettuce",
    "name": "生菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "romaine",
    "name": "油麦菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "water_spinach",
    "name": "空心菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chive",
    "name": "韭菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "celery",
    "name": "芹菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cilantro",
    "name": "香菜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "broccoli",
    "name": "西兰花",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cauliflower",
    "name": "菜花",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tomato",
    "name": "番茄",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.007,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cucumber",
    "name": "黄瓜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "eggplant",
    "name": "茄子",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.007,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "zucchini",
    "name": "西葫芦",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.007,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "winter_melon",
    "name": "冬瓜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.004,
    "shelfLifeDays": 20,
    "edibleRate": 0.92,
    "baseWasteRate": 0.05,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pumpkin",
    "name": "南瓜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.005,
    "shelfLifeDays": 20,
    "edibleRate": 0.92,
    "baseWasteRate": 0.05,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bitter_melon",
    "name": "苦瓜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "luffa",
    "name": "丝瓜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "green_pepper",
    "name": "青椒",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "red_pepper",
    "name": "红椒",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_pepper",
    "name": "鲜辣椒",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.015,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "potato",
    "name": "土豆",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.005,
    "shelfLifeDays": 20,
    "edibleRate": 0.92,
    "baseWasteRate": 0.05,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sweet_potato",
    "name": "红薯",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 20,
    "edibleRate": 0.92,
    "baseWasteRate": 0.05,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "taro",
    "name": "芋头",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 20,
    "edibleRate": 0.92,
    "baseWasteRate": 0.05,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lotus_root",
    "name": "莲藕",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 20,
    "edibleRate": 0.92,
    "baseWasteRate": 0.05,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "white_radish",
    "name": "白萝卜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.004,
    "shelfLifeDays": 20,
    "edibleRate": 0.92,
    "baseWasteRate": 0.05,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "carrot",
    "name": "胡萝卜",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 20,
    "edibleRate": 0.92,
    "baseWasteRate": 0.05,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "yam",
    "name": "山药",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.013,
    "shelfLifeDays": 20,
    "edibleRate": 0.92,
    "baseWasteRate": 0.05,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bamboo_shoot",
    "name": "鲜竹笋",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.015,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bean_sprout",
    "name": "黄豆芽",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.005,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mung_bean_sprout",
    "name": "绿豆芽",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.005,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "green_bean",
    "name": "四季豆",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.011,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shiitake",
    "name": "鲜香菇",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "oyster_mushroom",
    "name": "平菇",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "enoki_mushroom",
    "name": "金针菇",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "king_oyster_mushroom",
    "name": "杏鲍菇",
    "category": "vegetable",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 6,
    "edibleRate": 0.92,
    "baseWasteRate": 0.06,
    "procurementGroup": "produce",
    "allergenTags": [],
    "culinaryTags": [
      "vegetable"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "apple",
    "name": "苹果",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pear",
    "name": "梨",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "banana",
    "name": "香蕉",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 5,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "orange",
    "name": "橙子",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mandarin",
    "name": "橘子",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lemon",
    "name": "柠檬",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lime",
    "name": "青柠",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.02,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pineapple",
    "name": "菠萝",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "watermelon",
    "name": "西瓜",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.004,
    "shelfLifeDays": 10,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grape",
    "name": "葡萄",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.016,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "strawberry",
    "name": "草莓",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.028,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mango",
    "name": "芒果",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "peach",
    "name": "桃子",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "kiwi",
    "name": "猕猴桃",
    "category": "fruit",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 8,
    "edibleRate": 0.82,
    "baseWasteRate": 0.08,
    "procurementGroup": "fruit",
    "allergenTags": [],
    "culinaryTags": [
      "fruit"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "rice",
    "name": "大米",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "glutinous_rice",
    "name": "糯米",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "brown_rice",
    "name": "糙米",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "millet",
    "name": "小米",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cornmeal",
    "name": "玉米面",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "wheat_flour",
    "name": "中筋面粉",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.005,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "high_gluten_flour",
    "name": "高筋面粉",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.007,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "low_gluten_flour",
    "name": "低筋面粉",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.007,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "whole_wheat_flour",
    "name": "全麦面粉",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_noodle",
    "name": "挂面",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "rice_noodle",
    "name": "米粉",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "oats",
    "name": "燕麦",
    "category": "grain",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 180,
    "edibleRate": 0.99,
    "baseWasteRate": 0.01,
    "procurementGroup": "grain",
    "allergenTags": [],
    "culinaryTags": [
      "grain"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soybean",
    "name": "黄豆",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 120,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tofu",
    "name": "北豆腐",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 3,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "firm_tofu",
    "name": "老豆腐",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.007,
    "shelfLifeDays": 3,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "silken_tofu",
    "name": "嫩豆腐",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 3,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_tofu",
    "name": "豆干",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 7,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tofu_skin",
    "name": "豆皮",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.016,
    "shelfLifeDays": 3,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mung_bean",
    "name": "绿豆",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 120,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "red_bean",
    "name": "红豆",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.013,
    "shelfLifeDays": 120,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_bean",
    "name": "黑豆",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 120,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "broad_bean",
    "name": "蚕豆",
    "category": "bean",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 120,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "bean_products",
    "allergenTags": [],
    "culinaryTags": [
      "bean"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "egg",
    "name": "鸡蛋",
    "category": "egg",
    "unit": "piece",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.65,
    "shelfLifeDays": 20,
    "edibleRate": 0.9,
    "baseWasteRate": 0.04,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "egg"
    ],
    "culinaryTags": [
      "egg"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "duck_egg",
    "name": "鸭蛋",
    "category": "egg",
    "unit": "piece",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.9,
    "shelfLifeDays": 20,
    "edibleRate": 0.9,
    "baseWasteRate": 0.04,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "egg"
    ],
    "culinaryTags": [
      "egg"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "quail_egg",
    "name": "鹌鹑蛋",
    "category": "egg",
    "unit": "piece",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.22,
    "shelfLifeDays": 20,
    "edibleRate": 0.9,
    "baseWasteRate": 0.04,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "egg"
    ],
    "culinaryTags": [
      "egg"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "century_egg",
    "name": "皮蛋",
    "category": "egg",
    "unit": "piece",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.85,
    "shelfLifeDays": 90,
    "edibleRate": 0.9,
    "baseWasteRate": 0.04,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "egg"
    ],
    "culinaryTags": [
      "egg"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "milk",
    "name": "牛奶",
    "category": "dairy",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 14,
    "edibleRate": 1,
    "baseWasteRate": 0.02,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "dairy"
    ],
    "culinaryTags": [
      "dairy"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cream",
    "name": "淡奶油",
    "category": "dairy",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.025,
    "shelfLifeDays": 14,
    "edibleRate": 1,
    "baseWasteRate": 0.02,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "dairy"
    ],
    "culinaryTags": [
      "dairy"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "butter",
    "name": "黄油",
    "category": "dairy",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.045,
    "shelfLifeDays": 60,
    "edibleRate": 1,
    "baseWasteRate": 0.02,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "dairy"
    ],
    "culinaryTags": [
      "dairy"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cheese",
    "name": "奶酪",
    "category": "dairy",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 45,
    "edibleRate": 1,
    "baseWasteRate": 0.02,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "dairy"
    ],
    "culinaryTags": [
      "dairy"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "yogurt",
    "name": "酸奶",
    "category": "dairy",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 14,
    "edibleRate": 1,
    "baseWasteRate": 0.02,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "dairy"
    ],
    "culinaryTags": [
      "dairy"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "condensed_milk",
    "name": "炼乳",
    "category": "dairy",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.022,
    "shelfLifeDays": 14,
    "edibleRate": 1,
    "baseWasteRate": 0.02,
    "procurementGroup": "egg_dairy",
    "allergenTags": [
      "dairy"
    ],
    "culinaryTags": [
      "dairy"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "salt",
    "name": "食盐",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.004,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sugar",
    "name": "白砂糖",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.007,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "rock_sugar",
    "name": "冰糖",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soy_sauce",
    "name": "生抽",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dark_soy_sauce",
    "name": "老抽",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "vinegar",
    "name": "白醋",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.005,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "rice_vinegar",
    "name": "米醋",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.007,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_vinegar",
    "name": "陈醋",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.009,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "oyster_sauce",
    "name": "蚝油",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cooking_wine",
    "name": "料酒",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_sauce",
    "name": "辣椒酱",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "doubanjiang",
    "name": "郫县豆瓣酱",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.022,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soybean_paste",
    "name": "黄豆酱",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.015,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sweet_bean_paste",
    "name": "甜面酱",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.016,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "hoisin_sauce",
    "name": "海鲜酱",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.02,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "ketchup",
    "name": "番茄酱",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mustard",
    "name": "芥末",
    "category": "seasoning",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.03,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pepper_powder",
    "name": "黑胡椒粉",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.09,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "white_pepper",
    "name": "白胡椒粉",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.085,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sichuan_pepper",
    "name": "花椒",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.08,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "star_anise",
    "name": "八角",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.055,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cinnamon",
    "name": "桂皮",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.045,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bay_leaf",
    "name": "香叶",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cumin",
    "name": "孜然",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.055,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "five_spice",
    "name": "五香粉",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.05,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "msg",
    "name": "味精",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_powder",
    "name": "鸡精",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.026,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "baking_soda",
    "name": "食用小苏打",
    "category": "seasoning",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "seasoning",
    "allergenTags": [],
    "culinaryTags": [
      "seasoning"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soybean_oil",
    "name": "大豆油",
    "category": "oil",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "oil",
    "allergenTags": [],
    "culinaryTags": [
      "oil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "rapeseed_oil",
    "name": "菜籽油",
    "category": "oil",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "oil",
    "allergenTags": [],
    "culinaryTags": [
      "oil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "peanut_oil",
    "name": "花生油",
    "category": "oil",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.022,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "oil",
    "allergenTags": [
      "peanut"
    ],
    "culinaryTags": [
      "oil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "corn_oil",
    "name": "玉米油",
    "category": "oil",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.015,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "oil",
    "allergenTags": [],
    "culinaryTags": [
      "oil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sunflower_oil",
    "name": "葵花籽油",
    "category": "oil",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.016,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "oil",
    "allergenTags": [],
    "culinaryTags": [
      "oil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sesame_oil",
    "name": "芝麻油",
    "category": "oil",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.035,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "oil",
    "allergenTags": [
      "sesame"
    ],
    "culinaryTags": [
      "oil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lard",
    "name": "猪油",
    "category": "oil",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.025,
    "shelfLifeDays": 20,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "oil",
    "allergenTags": [],
    "culinaryTags": [
      "oil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_shiitake",
    "name": "干香菇",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.075,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_wood_ear",
    "name": "干木耳",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_tremella",
    "name": "银耳",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.07,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_daylily",
    "name": "黄花菜",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.055,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "vermicelli",
    "name": "粉丝",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bean_thread_noodle",
    "name": "红薯粉条",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.016,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_seaweed",
    "name": "紫菜",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.09,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_kelp",
    "name": "干海带",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.025,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_shrimp",
    "name": "虾皮",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.08,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_scallop",
    "name": "干贝",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.3,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_anchovy",
    "name": "小鱼干",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.09,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [
      "fish"
    ],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "peanut",
    "name": "花生米",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.014,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [
      "peanut"
    ],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cashew",
    "name": "腰果",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.065,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [
      "tree_nut"
    ],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "walnut",
    "name": "核桃仁",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [
      "tree_nut"
    ],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_sesame",
    "name": "黑芝麻",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.028,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [
      "sesame"
    ],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "white_sesame",
    "name": "白芝麻",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.026,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [
      "sesame"
    ],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_chili",
    "name": "干辣椒",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.045,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_date",
    "name": "红枣",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.025,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "goji_berry",
    "name": "枸杞",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lotus_seed",
    "name": "莲子",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.045,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_lily_bulb",
    "name": "百合干",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.06,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_tangerine_peel",
    "name": "陈皮",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.085,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_longan",
    "name": "桂圆干",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.04,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_plum",
    "name": "话梅",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.035,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_bamboo_shoot",
    "name": "笋干",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.05,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "preserved_mustard",
    "name": "梅干菜",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.022,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pickled_radish",
    "name": "萝卜干",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.018,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pickled_cabbage",
    "name": "酸菜",
    "category": "dry_goods",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 180,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "dry_goods",
    "allergenTags": [],
    "culinaryTags": [
      "dry_goods"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mineral_water",
    "name": "矿泉水",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.002,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soda_water",
    "name": "苏打水",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.004,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cola",
    "name": "可乐",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lemon_soda",
    "name": "柠檬汽水",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "orange_juice",
    "name": "橙汁",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "apple_juice",
    "name": "苹果汁",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "coconut_milk",
    "name": "椰奶",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.012,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soy_milk",
    "name": "豆浆",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 5,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [
      "soy"
    ],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "green_tea_drink",
    "name": "绿茶饮料",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_tea_drink",
    "name": "红茶饮料",
    "category": "beverage",
    "unit": "ml",
    "baseQuality": 3,
    "storageType": "room",
    "basePurchasePrice": 0.006,
    "shelfLifeDays": 180,
    "edibleRate": 1,
    "baseWasteRate": 0,
    "procurementGroup": "beverage",
    "allergenTags": [],
    "culinaryTags": [
      "beverage"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "potato_starch",
    "name": "马铃薯淀粉",
    "category": "other",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.01,
    "shelfLifeDays": 120,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "processed",
    "allergenTags": [],
    "culinaryTags": [
      "other"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "corn_starch",
    "name": "玉米淀粉",
    "category": "other",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.008,
    "shelfLifeDays": 120,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "processed",
    "allergenTags": [],
    "culinaryTags": [
      "other"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dumpling_wrapper",
    "name": "饺子皮",
    "category": "other",
    "unit": "piece",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.18,
    "shelfLifeDays": 5,
    "edibleRate": 1,
    "baseWasteRate": 0.01,
    "procurementGroup": "processed",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "other"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "wonton_wrapper",
    "name": "馄饨皮",
    "category": "other",
    "unit": "piece",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.12,
    "shelfLifeDays": 5,
    "edibleRate": 1,
    "baseWasteRate": 0.01,
    "procurementGroup": "processed",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "other"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spring_roll_wrapper",
    "name": "春卷皮",
    "category": "other",
    "unit": "piece",
    "baseQuality": 3,
    "storageType": "chilled",
    "basePurchasePrice": 0.2,
    "shelfLifeDays": 5,
    "edibleRate": 1,
    "baseWasteRate": 0.01,
    "procurementGroup": "processed",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "other"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "breadcrumbs",
    "name": "面包糠",
    "category": "other",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.016,
    "shelfLifeDays": 120,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "processed",
    "allergenTags": [
      "gluten"
    ],
    "culinaryTags": [
      "other"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "gelatin",
    "name": "明胶",
    "category": "other",
    "unit": "g",
    "baseQuality": 3,
    "storageType": "dry",
    "basePurchasePrice": 0.055,
    "shelfLifeDays": 120,
    "edibleRate": 0.98,
    "baseWasteRate": 0.02,
    "procurementGroup": "processed",
    "allergenTags": [],
    "culinaryTags": [
      "other"
    ]
  }
]
);
