export const DISH_DATASET_META = Object.freeze({
  "schemaVersion": 1,
  "datasetVersion": "1.0.0",
  "total": 350,
  "categories": {
    "rice": 30,
    "noodle": 25,
    "dumpling_bun": 25,
    "stir_fry": 55,
    "cold_dish": 25,
    "soup": 25,
    "hotpot": 15,
    "barbecue": 20,
    "breakfast": 20,
    "snack": 25,
    "fast_food": 15,
    "set_meal": 10,
    "dessert": 20,
    "beverage": 15,
    "bakery": 10,
    "specialty": 15
  },
  "sourceIngredientCatalog": "ingredients.v1",
  "sourceIngredientCount": 220
});

export const DISHES_V1 = Object.freeze([
  {
    "schemaVersion": 1,
    "id": "egg_fried_rice",
    "name": "蛋炒饭",
    "category": "rice",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_egg_fried_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soy_sauce_fried_rice",
    "name": "酱油炒饭",
    "category": "rice",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_soy_sauce_fried_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tomato_egg_rice",
    "name": "番茄鸡蛋盖饭",
    "category": "rice",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 22,
    "defaultRecipeId": "recipe_tomato_egg_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "braised_pork_belly_rice",
    "name": "红烧肉盖饭",
    "category": "rice",
    "basePrice": 36,
    "unlockLevel": 2,
    "baseDifficulty": 45,
    "defaultRecipeId": "recipe_braised_pork_belly_rice_standard",
    "tags": [
      "rice",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_pepper_beef_rice",
    "name": "黑椒牛肉饭",
    "category": "rice",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_black_pepper_beef_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cumin_lamb_rice",
    "name": "孜然羊肉饭",
    "category": "rice",
    "basePrice": 44,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_cumin_lamb_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_chicken_rice",
    "name": "香菇鸡腿饭",
    "category": "rice",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_mushroom_chicken_rice_standard",
    "tags": [
      "rice",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spicy_chicken_rice",
    "name": "鲜椒鸡丁饭",
    "category": "rice",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 35,
    "defaultRecipeId": "recipe_spicy_chicken_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_rib_rice",
    "name": "红烧排骨饭",
    "category": "rice",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_pork_rib_rice_standard",
    "tags": [
      "rice",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "brisket_potato_rice",
    "name": "土豆牛腩饭",
    "category": "rice",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_brisket_potato_rice_standard",
    "tags": [
      "rice",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "eggplant_pork_rice",
    "name": "茄子肉末饭",
    "category": "rice",
    "basePrice": 28,
    "unlockLevel": 2,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_eggplant_pork_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tofu_mushroom_rice",
    "name": "香菇豆腐饭",
    "category": "rice",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_tofu_mushroom_rice_standard",
    "tags": [
      "rice",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_egg_rice",
    "name": "虾仁滑蛋饭",
    "category": "rice",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_shrimp_egg_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "scallop_rice",
    "name": "干贝鲜蔬饭",
    "category": "rice",
    "basePrice": 46,
    "unlockLevel": 4,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_scallop_rice_standard",
    "tags": [
      "rice",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "crab_rice",
    "name": "蟹肉鲜蔬饭",
    "category": "rice",
    "basePrice": 58,
    "unlockLevel": 5,
    "baseDifficulty": 55,
    "defaultRecipeId": "recipe_crab_rice_standard",
    "tags": [
      "rice",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "salmon_rice",
    "name": "香煎三文鱼饭",
    "category": "rice",
    "basePrice": 58,
    "unlockLevel": 5,
    "baseDifficulty": 52,
    "defaultRecipeId": "recipe_salmon_rice_standard",
    "tags": [
      "rice",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "duck_leg_rice",
    "name": "酱香鸭腿饭",
    "category": "rice",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_duck_leg_rice_standard",
    "tags": [
      "rice",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "goose_rice",
    "name": "五香鹅肉饭",
    "category": "rice",
    "basePrice": 48,
    "unlockLevel": 4,
    "baseDifficulty": 52,
    "defaultRecipeId": "recipe_goose_rice_standard",
    "tags": [
      "rice",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "preserved_pork_claypot_rice",
    "name": "梅干菜五花肉煲仔饭",
    "category": "rice",
    "basePrice": 38,
    "unlockLevel": 4,
    "baseDifficulty": 50,
    "defaultRecipeId": "recipe_preserved_pork_claypot_rice_standard",
    "tags": [
      "rice",
      "claypot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pumpkin_rice",
    "name": "南瓜焖饭",
    "category": "rice",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_pumpkin_rice_standard",
    "tags": [
      "rice",
      "claypot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "taro_pork_rice",
    "name": "芋头猪肉焖饭",
    "category": "rice",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_taro_pork_rice_standard",
    "tags": [
      "rice",
      "claypot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sweet_potato_rice",
    "name": "红薯杂粮饭",
    "category": "rice",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 22,
    "defaultRecipeId": "recipe_sweet_potato_rice_standard",
    "tags": [
      "rice",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lotus_rib_rice",
    "name": "莲藕排骨饭",
    "category": "rice",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_lotus_rib_rice_standard",
    "tags": [
      "rice",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bamboo_pork_rice",
    "name": "笋香肉片饭",
    "category": "rice",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_bamboo_pork_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "king_oyster_beef_rice",
    "name": "杏鲍菇牛肉饭",
    "category": "rice",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_king_oyster_beef_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cabbage_pork_rice",
    "name": "包菜猪肉饭",
    "category": "rice",
    "basePrice": 26,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_cabbage_pork_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spinach_egg_rice",
    "name": "菠菜鸡蛋饭",
    "category": "rice",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_spinach_egg_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "seafood_rice",
    "name": "三鲜海味饭",
    "category": "rice",
    "basePrice": 52,
    "unlockLevel": 5,
    "baseDifficulty": 55,
    "defaultRecipeId": "recipe_seafood_rice_standard",
    "tags": [
      "rice",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "brown_rice_chicken_bowl",
    "name": "糙米鸡胸饭",
    "category": "rice",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_brown_rice_chicken_bowl_standard",
    "tags": [
      "rice",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "glutinous_chicken_rice",
    "name": "糯米鸡",
    "category": "rice",
    "basePrice": 32,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_glutinous_chicken_rice_standard",
    "tags": [
      "rice",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_noodle",
    "name": "牛肉面",
    "category": "noodle",
    "basePrice": 38,
    "unlockLevel": 2,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_beef_noodle_standard",
    "tags": [
      "noodle",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "brisket_noodle",
    "name": "牛腩面",
    "category": "noodle",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_brisket_noodle_standard",
    "tags": [
      "noodle",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_rib_noodle",
    "name": "排骨面",
    "category": "noodle",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_pork_rib_noodle_standard",
    "tags": [
      "noodle",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_noodle",
    "name": "鸡汤面",
    "category": "noodle",
    "basePrice": 28,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_chicken_noodle_standard",
    "tags": [
      "noodle",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tomato_egg_noodle",
    "name": "番茄鸡蛋面",
    "category": "noodle",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 22,
    "defaultRecipeId": "recipe_tomato_egg_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pickled_beef_noodle",
    "name": "酸菜牛肉面",
    "category": "noodle",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 35,
    "defaultRecipeId": "recipe_pickled_beef_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_chicken_noodle",
    "name": "香菇鸡丝面",
    "category": "noodle",
    "basePrice": 28,
    "unlockLevel": 2,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_mushroom_chicken_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "seafood_noodle",
    "name": "海鲜面",
    "category": "noodle",
    "basePrice": 46,
    "unlockLevel": 4,
    "baseDifficulty": 50,
    "defaultRecipeId": "recipe_seafood_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_noodle",
    "name": "鲜虾面",
    "category": "noodle",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_shrimp_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "squid_noodle",
    "name": "鱿鱼汤面",
    "category": "noodle",
    "basePrice": 34,
    "unlockLevel": 3,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_squid_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "intestine_noodle",
    "name": "肥肠面",
    "category": "noodle",
    "basePrice": 36,
    "unlockLevel": 4,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_intestine_noodle_standard",
    "tags": [
      "noodle",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "liver_noodle",
    "name": "猪肝面",
    "category": "noodle",
    "basePrice": 28,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_liver_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tofu_mushroom_noodle",
    "name": "豆腐菌菇面",
    "category": "noodle",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 26,
    "defaultRecipeId": "recipe_tofu_mushroom_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sesame_peanut_noodle",
    "name": "麻酱花生拌面",
    "category": "noodle",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 26,
    "defaultRecipeId": "recipe_sesame_peanut_noodle_standard",
    "tags": [
      "noodle",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spicy_bean_noodle",
    "name": "豆瓣辣酱拌面",
    "category": "noodle",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_spicy_bean_noodle_standard",
    "tags": [
      "noodle",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_pepper_beef_noodle",
    "name": "黑椒牛柳面",
    "category": "noodle",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_black_pepper_beef_noodle_standard",
    "tags": [
      "noodle",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cumin_lamb_noodle",
    "name": "孜然羊肉拌面",
    "category": "noodle",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_cumin_lamb_noodle_standard",
    "tags": [
      "noodle",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "duck_noodle",
    "name": "卤香鸭腿面",
    "category": "noodle",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_duck_noodle_standard",
    "tags": [
      "noodle",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fish_noodle",
    "name": "鲜鱼片汤面",
    "category": "noodle",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 45,
    "defaultRecipeId": "recipe_fish_noodle_standard",
    "tags": [
      "noodle",
      "poach"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "hot_sour_rice_noodle",
    "name": "酸辣米粉",
    "category": "noodle",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_hot_sour_rice_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_rice_noodle",
    "name": "牛肉米粉",
    "category": "noodle",
    "basePrice": 38,
    "unlockLevel": 2,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_beef_rice_noodle_standard",
    "tags": [
      "noodle",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_rice_noodle",
    "name": "鸡丝米粉",
    "category": "noodle",
    "basePrice": 28,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_chicken_rice_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "clam_rice_noodle",
    "name": "花蛤米粉",
    "category": "noodle",
    "basePrice": 34,
    "unlockLevel": 3,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_clam_rice_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_rice_noodle",
    "name": "菌菇米粉",
    "category": "noodle",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 26,
    "defaultRecipeId": "recipe_mushroom_rice_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "vegetable_rice_noodle",
    "name": "时蔬米粉",
    "category": "noodle",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_vegetable_rice_noodle_standard",
    "tags": [
      "noodle",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_cabbage_dumpling",
    "name": "猪肉白菜水饺",
    "category": "dumpling_bun",
    "basePrice": 26,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_pork_cabbage_dumpling_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_chive_dumpling",
    "name": "猪肉韭菜水饺",
    "category": "dumpling_bun",
    "basePrice": 26,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_pork_chive_dumpling_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_celery_dumpling",
    "name": "牛肉芹菜水饺",
    "category": "dumpling_bun",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 35,
    "defaultRecipeId": "recipe_beef_celery_dumpling_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lamb_carrot_dumpling",
    "name": "羊肉胡萝卜水饺",
    "category": "dumpling_bun",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_lamb_carrot_dumpling_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_mushroom_dumpling",
    "name": "鸡肉香菇水饺",
    "category": "dumpling_bun",
    "basePrice": 28,
    "unlockLevel": 1,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_chicken_mushroom_dumpling_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_chive_dumpling",
    "name": "鲜虾韭菜水饺",
    "category": "dumpling_bun",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_shrimp_chive_dumpling_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "vegetable_mushroom_dumpling",
    "name": "菌菇素水饺",
    "category": "dumpling_bun",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_vegetable_mushroom_dumpling_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_wonton",
    "name": "鲜肉馄饨",
    "category": "dumpling_bun",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_pork_wonton_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_wonton",
    "name": "鲜虾馄饨",
    "category": "dumpling_bun",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_shrimp_wonton_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_wonton",
    "name": "鸡肉馄饨",
    "category": "dumpling_bun",
    "basePrice": 26,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_chicken_wonton_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fish_wonton",
    "name": "鱼肉馄饨",
    "category": "dumpling_bun",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_fish_wonton_standard",
    "tags": [
      "dumpling_bun",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_steamed_bun",
    "name": "鲜肉包",
    "category": "dumpling_bun",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_pork_steamed_bun_standard",
    "tags": [
      "dumpling_bun",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_steamed_bun",
    "name": "牛肉包",
    "category": "dumpling_bun",
    "basePrice": 26,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_beef_steamed_bun_standard",
    "tags": [
      "dumpling_bun",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_mushroom_bun",
    "name": "香菇鸡肉包",
    "category": "dumpling_bun",
    "basePrice": 24,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_chicken_mushroom_bun_standard",
    "tags": [
      "dumpling_bun",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tofu_cabbage_bun",
    "name": "白菜豆腐包",
    "category": "dumpling_bun",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_tofu_cabbage_bun_standard",
    "tags": [
      "dumpling_bun",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "red_bean_bun",
    "name": "红豆甜包",
    "category": "dumpling_bun",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_red_bean_bun_standard",
    "tags": [
      "dumpling_bun",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pumpkin_bun",
    "name": "南瓜甜包",
    "category": "dumpling_bun",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_pumpkin_bun_standard",
    "tags": [
      "dumpling_bun",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_pan_dumpling",
    "name": "猪肉锅贴",
    "category": "dumpling_bun",
    "basePrice": 28,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_pork_pan_dumpling_standard",
    "tags": [
      "dumpling_bun",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_pan_dumpling",
    "name": "牛肉锅贴",
    "category": "dumpling_bun",
    "basePrice": 34,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_beef_pan_dumpling_standard",
    "tags": [
      "dumpling_bun",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "vegetable_spring_roll",
    "name": "素春卷",
    "category": "dumpling_bun",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_vegetable_spring_roll_standard",
    "tags": [
      "dumpling_bun",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_spring_roll",
    "name": "鸡肉春卷",
    "category": "dumpling_bun",
    "basePrice": 26,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_chicken_spring_roll_standard",
    "tags": [
      "dumpling_bun",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_spring_roll",
    "name": "鲜虾春卷",
    "category": "dumpling_bun",
    "basePrice": 32,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_shrimp_spring_roll_standard",
    "tags": [
      "dumpling_bun",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chive_egg_pancake",
    "name": "韭菜鸡蛋馅饼",
    "category": "dumpling_bun",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_chive_egg_pancake_standard",
    "tags": [
      "dumpling_bun",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pumpkin_pancake",
    "name": "香甜南瓜饼",
    "category": "dumpling_bun",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_pumpkin_pancake_standard",
    "tags": [
      "dumpling_bun",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sweet_potato_pancake",
    "name": "红薯饼",
    "category": "dumpling_bun",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_sweet_potato_pancake_standard",
    "tags": [
      "dumpling_bun",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "green_pepper_pork",
    "name": "青椒里脊",
    "category": "stir_fry",
    "basePrice": 32,
    "unlockLevel": 1,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_green_pepper_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "celery_pork",
    "name": "芹菜肉片",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_celery_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_pork",
    "name": "香菇肉片",
    "category": "stir_fry",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_mushroom_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cabbage_pork",
    "name": "包菜炒肉",
    "category": "stir_fry",
    "basePrice": 28,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_cabbage_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bamboo_pork",
    "name": "鲜笋肉片",
    "category": "stir_fry",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_bamboo_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_tofu_pork",
    "name": "豆干炒肉",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_dried_tofu_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "green_bean_pork",
    "name": "四季豆炒肉",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_green_bean_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cauliflower_pork",
    "name": "菜花炒肉",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_cauliflower_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_pork_belly",
    "name": "鲜椒五花肉",
    "category": "stir_fry",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_chili_pork_belly_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "douban_pork_belly",
    "name": "豆瓣回锅肉",
    "category": "stir_fry",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_douban_pork_belly_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sweet_sour_tenderloin",
    "name": "糖醋里脊",
    "category": "stir_fry",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_sweet_sour_tenderloin_standard",
    "tags": [
      "stir_fry",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_pepper_pork",
    "name": "黑椒里脊",
    "category": "stir_fry",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_black_pepper_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tomato_pork",
    "name": "番茄肉片",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_tomato_pork_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "celery_liver",
    "name": "芹菜猪肝",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_celery_liver_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spicy_intestine",
    "name": "香辣肥肠",
    "category": "stir_fry",
    "basePrice": 42,
    "unlockLevel": 4,
    "baseDifficulty": 52,
    "defaultRecipeId": "recipe_spicy_intestine_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "green_pepper_beef",
    "name": "青椒牛肉",
    "category": "stir_fry",
    "basePrice": 38,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_green_pepper_beef_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_pepper_beef",
    "name": "黑椒牛柳",
    "category": "stir_fry",
    "basePrice": 46,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_black_pepper_beef_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cumin_beef",
    "name": "孜然牛肉",
    "category": "stir_fry",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_cumin_beef_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "celery_beef",
    "name": "芹菜牛肉",
    "category": "stir_fry",
    "basePrice": 38,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_celery_beef_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_beef",
    "name": "香菇牛肉",
    "category": "stir_fry",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_mushroom_beef_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "broccoli_beef",
    "name": "西兰花牛肉",
    "category": "stir_fry",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_broccoli_beef_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_beef",
    "name": "鲜椒牛肉",
    "category": "stir_fry",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_chili_beef_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_tripe",
    "name": "辣炒牛肚",
    "category": "stir_fry",
    "basePrice": 42,
    "unlockLevel": 4,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_chili_tripe_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cumin_lamb",
    "name": "孜然羊肉",
    "category": "stir_fry",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_cumin_lamb_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_lamb",
    "name": "鲜椒羊肉",
    "category": "stir_fry",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_chili_lamb_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "celery_lamb",
    "name": "芹菜羊肉",
    "category": "stir_fry",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_celery_lamb_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "carrot_lamb",
    "name": "胡萝卜羊肉",
    "category": "stir_fry",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_carrot_lamb_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_chicken",
    "name": "香菇鸡片",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 1,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_mushroom_chicken_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_chicken",
    "name": "鲜椒鸡丁",
    "category": "stir_fry",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_chili_chicken_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "kungpao_chicken",
    "name": "花生辣鸡丁",
    "category": "stir_fry",
    "basePrice": 34,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_kungpao_chicken_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_pepper_chicken",
    "name": "黑椒鸡柳",
    "category": "stir_fry",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_black_pepper_chicken_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cashew_chicken",
    "name": "腰果鸡丁",
    "category": "stir_fry",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_cashew_chicken_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "broccoli_chicken",
    "name": "西兰花鸡片",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 1,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_broccoli_chicken_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "green_pepper_chicken",
    "name": "青椒鸡丁",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 1,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_green_pepper_chicken_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "eggplant_chicken",
    "name": "茄子鸡丁",
    "category": "stir_fry",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_eggplant_chicken_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pepper_duck_breast",
    "name": "彩椒鸭胸",
    "category": "stir_fry",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_pepper_duck_breast_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_duck",
    "name": "香菇鸭胸",
    "category": "stir_fry",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_mushroom_duck_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_egg",
    "name": "虾仁炒蛋",
    "category": "stir_fry",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_shrimp_egg_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "broccoli_shrimp",
    "name": "西兰花虾仁",
    "category": "stir_fry",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_broccoli_shrimp_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "green_bean_shrimp",
    "name": "四季豆虾仁",
    "category": "stir_fry",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_green_bean_shrimp_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_squid",
    "name": "鲜椒鱿鱼",
    "category": "stir_fry",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_chili_squid_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "celery_squid",
    "name": "芹菜鱿鱼",
    "category": "stir_fry",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_celery_squid_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "broccoli_scallop",
    "name": "西兰花扇贝",
    "category": "stir_fry",
    "basePrice": 48,
    "unlockLevel": 4,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_broccoli_scallop_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_clam",
    "name": "香辣花蛤",
    "category": "stir_fry",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_chili_clam_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pickled_fish",
    "name": "酸菜鱼片",
    "category": "stir_fry",
    "basePrice": 48,
    "unlockLevel": 4,
    "baseDifficulty": 55,
    "defaultRecipeId": "recipe_pickled_fish_standard",
    "tags": [
      "stir_fry",
      "poach"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_fish",
    "name": "鲜椒鱼片",
    "category": "stir_fry",
    "basePrice": 42,
    "unlockLevel": 4,
    "baseDifficulty": 50,
    "defaultRecipeId": "recipe_chili_fish_standard",
    "tags": [
      "stir_fry",
      "poach"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tomato_egg",
    "name": "番茄炒蛋",
    "category": "stir_fry",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_tomato_egg_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chive_egg",
    "name": "韭菜炒蛋",
    "category": "stir_fry",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_chive_egg_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bitter_melon_egg",
    "name": "苦瓜炒蛋",
    "category": "stir_fry",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_bitter_melon_egg_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_egg",
    "name": "香菇炒蛋",
    "category": "stir_fry",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_mushroom_egg_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mapo_tofu",
    "name": "豆瓣麻辣豆腐",
    "category": "stir_fry",
    "basePrice": 26,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_mapo_tofu_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "home_tofu",
    "name": "青椒家常豆腐",
    "category": "stir_fry",
    "basePrice": 28,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_home_tofu_standard",
    "tags": [
      "stir_fry",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soybean_eggplant",
    "name": "酱烧茄子",
    "category": "stir_fry",
    "basePrice": 26,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_soybean_eggplant_standard",
    "tags": [
      "stir_fry",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dry_fried_green_beans",
    "name": "干煸四季豆",
    "category": "stir_fry",
    "basePrice": 28,
    "unlockLevel": 3,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_dry_fried_green_beans_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mixed_mushrooms",
    "name": "三菇小炒",
    "category": "stir_fry",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_mixed_mushrooms_standard",
    "tags": [
      "stir_fry",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "vinegar_cucumber",
    "name": "陈醋拍黄瓜",
    "category": "cold_dish",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 12,
    "defaultRecipeId": "recipe_vinegar_cucumber_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sesame_cucumber",
    "name": "麻油黄瓜",
    "category": "cold_dish",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 14,
    "defaultRecipeId": "recipe_sesame_cucumber_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "wood_ear_salad",
    "name": "凉拌木耳",
    "category": "cold_dish",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_wood_ear_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tofu_skin_salad",
    "name": "凉拌豆皮",
    "category": "cold_dish",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_tofu_skin_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "dried_tofu_celery",
    "name": "芹菜拌豆干",
    "category": "cold_dish",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_dried_tofu_celery_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "century_egg_tofu",
    "name": "皮蛋豆腐",
    "category": "cold_dish",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_century_egg_tofu_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spinach_peanut",
    "name": "菠菜花生米",
    "category": "cold_dish",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_spinach_peanut_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "celery_peanut",
    "name": "芹菜花生米",
    "category": "cold_dish",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_celery_peanut_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "vinegar_potato",
    "name": "酸辣土豆丝",
    "category": "cold_dish",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 22,
    "defaultRecipeId": "recipe_vinegar_potato_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "kelp_salad",
    "name": "凉拌海带丝",
    "category": "cold_dish",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_kelp_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "enoki_salad",
    "name": "凉拌金针菇",
    "category": "cold_dish",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 22,
    "defaultRecipeId": "recipe_enoki_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sesame_bok_choy",
    "name": "芝麻小白菜",
    "category": "cold_dish",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_sesame_bok_choy_standard",
    "tags": [
      "cold_dish",
      "blanch"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_cucumber_salad",
    "name": "鸡丝拌黄瓜",
    "category": "cold_dish",
    "basePrice": 28,
    "unlockLevel": 2,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_chicken_cucumber_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spicy_chicken_salad",
    "name": "麻辣鸡丝",
    "category": "cold_dish",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_spicy_chicken_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "duck_breast_salad",
    "name": "凉拌鸭胸",
    "category": "cold_dish",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_duck_breast_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_shank_salad",
    "name": "凉拌牛腱",
    "category": "cold_dish",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_beef_shank_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spicy_tripe_salad",
    "name": "麻辣牛肚",
    "category": "cold_dish",
    "basePrice": 42,
    "unlockLevel": 4,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_spicy_tripe_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pepper_liver_salad",
    "name": "椒香猪肝",
    "category": "cold_dish",
    "basePrice": 28,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_pepper_liver_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_cucumber_salad",
    "name": "鲜虾拌黄瓜",
    "category": "cold_dish",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_shrimp_cucumber_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "octopus_salad",
    "name": "椒香章鱼",
    "category": "cold_dish",
    "basePrice": 46,
    "unlockLevel": 4,
    "baseDifficulty": 50,
    "defaultRecipeId": "recipe_octopus_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "squid_salad",
    "name": "凉拌鱿鱼",
    "category": "cold_dish",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_squid_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "clam_salad",
    "name": "凉拌花蛤",
    "category": "cold_dish",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_clam_salad_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "seaweed_cucumber",
    "name": "紫菜拌黄瓜",
    "category": "cold_dish",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_seaweed_cucumber_standard",
    "tags": [
      "cold_dish",
      "cold_mix"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sugar_tomato",
    "name": "糖拌番茄",
    "category": "cold_dish",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 8,
    "defaultRecipeId": "recipe_sugar_tomato_standard",
    "tags": [
      "cold_dish",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fruit_salad",
    "name": "酸奶水果沙拉",
    "category": "cold_dish",
    "basePrice": 28,
    "unlockLevel": 2,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_fruit_salad_standard",
    "tags": [
      "cold_dish",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tomato_egg_soup",
    "name": "番茄鸡蛋汤",
    "category": "soup",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_tomato_egg_soup_standard",
    "tags": [
      "soup",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "seaweed_egg_soup",
    "name": "紫菜蛋花汤",
    "category": "soup",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 16,
    "defaultRecipeId": "recipe_seaweed_egg_soup_standard",
    "tags": [
      "soup",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spinach_egg_soup",
    "name": "菠菜蛋花汤",
    "category": "soup",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_spinach_egg_soup_standard",
    "tags": [
      "soup",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "winter_melon_rib_soup",
    "name": "冬瓜排骨汤",
    "category": "soup",
    "basePrice": 36,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_winter_melon_rib_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lotus_rib_soup",
    "name": "莲藕排骨汤",
    "category": "soup",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_lotus_rib_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "radish_beef_soup",
    "name": "萝卜牛肉汤",
    "category": "soup",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_radish_beef_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "potato_beef_soup",
    "name": "土豆牛腩汤",
    "category": "soup",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_potato_beef_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tomato_beef_soup",
    "name": "番茄牛腩汤",
    "category": "soup",
    "basePrice": 44,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_tomato_beef_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_chicken_soup",
    "name": "香菇鸡汤",
    "category": "soup",
    "basePrice": 36,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_mushroom_chicken_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "yam_chicken_soup",
    "name": "山药鸡汤",
    "category": "soup",
    "basePrice": 36,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_yam_chicken_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "taro_duck_soup",
    "name": "芋头老鸭汤",
    "category": "soup",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_taro_duck_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "crucian_tofu_soup",
    "name": "鲫鱼豆腐汤",
    "category": "soup",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_crucian_tofu_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "carp_soup",
    "name": "鲤鱼鲜汤",
    "category": "soup",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_carp_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "bass_tofu_soup",
    "name": "鲈鱼豆腐汤",
    "category": "soup",
    "basePrice": 46,
    "unlockLevel": 4,
    "baseDifficulty": 50,
    "defaultRecipeId": "recipe_bass_tofu_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "clam_tofu_soup",
    "name": "花蛤豆腐汤",
    "category": "soup",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_clam_tofu_soup_standard",
    "tags": [
      "soup",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_winter_melon_soup",
    "name": "鲜虾冬瓜汤",
    "category": "soup",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_shrimp_winter_melon_soup_standard",
    "tags": [
      "soup",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sea_cucumber_chicken_soup",
    "name": "海参鸡汤",
    "category": "soup",
    "basePrice": 68,
    "unlockLevel": 6,
    "baseDifficulty": 62,
    "defaultRecipeId": "recipe_sea_cucumber_chicken_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "abalone_chicken_soup",
    "name": "鲍鱼鸡汤",
    "category": "soup",
    "basePrice": 78,
    "unlockLevel": 7,
    "baseDifficulty": 66,
    "defaultRecipeId": "recipe_abalone_chicken_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_tofu_soup",
    "name": "菌菇豆腐汤",
    "category": "soup",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 26,
    "defaultRecipeId": "recipe_mushroom_tofu_soup_standard",
    "tags": [
      "soup",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cabbage_tofu_soup",
    "name": "白菜豆腐汤",
    "category": "soup",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_cabbage_tofu_soup_standard",
    "tags": [
      "soup",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "red_date_goji_chicken_soup",
    "name": "红枣枸杞鸡汤",
    "category": "soup",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_red_date_goji_chicken_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pickled_pork_soup",
    "name": "酸菜白肉汤",
    "category": "soup",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_pickled_pork_soup_standard",
    "tags": [
      "soup",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "seaweed_shrimp_soup",
    "name": "紫菜虾皮汤",
    "category": "soup",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_seaweed_shrimp_soup_standard",
    "tags": [
      "soup",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "oyster_tofu_soup",
    "name": "生蚝豆腐汤",
    "category": "soup",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_oyster_tofu_soup_standard",
    "tags": [
      "soup",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tremella_lotus_soup",
    "name": "银耳莲子羹",
    "category": "soup",
    "basePrice": 26,
    "unlockLevel": 2,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_tremella_lotus_soup_standard",
    "tags": [
      "soup",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spicy_beef_hotpot",
    "name": "麻辣牛肉锅",
    "category": "hotpot",
    "basePrice": 58,
    "unlockLevel": 4,
    "baseDifficulty": 54,
    "defaultRecipeId": "recipe_spicy_beef_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tomato_brisket_hotpot",
    "name": "番茄牛腩锅",
    "category": "hotpot",
    "basePrice": 62,
    "unlockLevel": 4,
    "baseDifficulty": 52,
    "defaultRecipeId": "recipe_tomato_brisket_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pickled_fish_hotpot",
    "name": "酸菜鱼锅",
    "category": "hotpot",
    "basePrice": 58,
    "unlockLevel": 4,
    "baseDifficulty": 56,
    "defaultRecipeId": "recipe_pickled_fish_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_chicken_hotpot",
    "name": "菌菇鸡锅",
    "category": "hotpot",
    "basePrice": 52,
    "unlockLevel": 3,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_mushroom_chicken_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lamb_hotpot",
    "name": "羊肉涮锅",
    "category": "hotpot",
    "basePrice": 58,
    "unlockLevel": 3,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_lamb_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "seafood_hotpot",
    "name": "海鲜拼锅",
    "category": "hotpot",
    "basePrice": 78,
    "unlockLevel": 6,
    "baseDifficulty": 62,
    "defaultRecipeId": "recipe_seafood_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spicy_intestine_hotpot",
    "name": "香辣肥肠锅",
    "category": "hotpot",
    "basePrice": 58,
    "unlockLevel": 5,
    "baseDifficulty": 60,
    "defaultRecipeId": "recipe_spicy_intestine_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tofu_vegetable_hotpot",
    "name": "豆腐时蔬锅",
    "category": "hotpot",
    "basePrice": 38,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_tofu_vegetable_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_hotpot",
    "name": "山野菌菇锅",
    "category": "hotpot",
    "basePrice": 42,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_mushroom_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_crab_hotpot",
    "name": "鲜虾蟹锅",
    "category": "hotpot",
    "basePrice": 88,
    "unlockLevel": 7,
    "baseDifficulty": 68,
    "defaultRecipeId": "recipe_shrimp_crab_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tripe_hotpot",
    "name": "麻辣牛肚锅",
    "category": "hotpot",
    "basePrice": 62,
    "unlockLevel": 5,
    "baseDifficulty": 62,
    "defaultRecipeId": "recipe_tripe_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "trotter_hotpot",
    "name": "猪蹄煲",
    "category": "hotpot",
    "basePrice": 58,
    "unlockLevel": 5,
    "baseDifficulty": 60,
    "defaultRecipeId": "recipe_trotter_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lamb_rack_hotpot",
    "name": "羊排萝卜锅",
    "category": "hotpot",
    "basePrice": 68,
    "unlockLevel": 5,
    "baseDifficulty": 62,
    "defaultRecipeId": "recipe_lamb_rack_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "snakehead_tomato_hotpot",
    "name": "番茄黑鱼锅",
    "category": "hotpot",
    "basePrice": 62,
    "unlockLevel": 5,
    "baseDifficulty": 58,
    "defaultRecipeId": "recipe_snakehead_tomato_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "seafood_tofu_hotpot",
    "name": "海鲜豆腐锅",
    "category": "hotpot",
    "basePrice": 68,
    "unlockLevel": 5,
    "baseDifficulty": 58,
    "defaultRecipeId": "recipe_seafood_tofu_hotpot_standard",
    "tags": [
      "hotpot",
      "hotpot"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cumin_lamb_skewer",
    "name": "孜然羊肉串",
    "category": "barbecue",
    "basePrice": 38,
    "unlockLevel": 2,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_cumin_lamb_skewer_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_lamb_rack",
    "name": "烤羊排",
    "category": "barbecue",
    "basePrice": 68,
    "unlockLevel": 5,
    "baseDifficulty": 58,
    "defaultRecipeId": "recipe_grilled_lamb_rack_standard",
    "tags": [
      "barbecue",
      "roast"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_skewer",
    "name": "牛肉串",
    "category": "barbecue",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_beef_skewer_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_pepper_beef_skewer",
    "name": "黑椒牛肉串",
    "category": "barbecue",
    "basePrice": 46,
    "unlockLevel": 3,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_black_pepper_beef_skewer_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_pork_belly",
    "name": "烤五花肉",
    "category": "barbecue",
    "basePrice": 38,
    "unlockLevel": 2,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_grilled_pork_belly_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_ribs",
    "name": "烤排骨",
    "category": "barbecue",
    "basePrice": 48,
    "unlockLevel": 4,
    "baseDifficulty": 52,
    "defaultRecipeId": "recipe_grilled_ribs_standard",
    "tags": [
      "barbecue",
      "roast"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_chicken_wings",
    "name": "烤鸡翅",
    "category": "barbecue",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_grilled_chicken_wings_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_chicken_thigh",
    "name": "烤鸡腿",
    "category": "barbecue",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_grilled_chicken_thigh_standard",
    "tags": [
      "barbecue",
      "roast"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_duck_breast",
    "name": "烤鸭胸",
    "category": "barbecue",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_grilled_duck_breast_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_squid",
    "name": "烤鱿鱼",
    "category": "barbecue",
    "basePrice": 42,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_grilled_squid_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_shrimp",
    "name": "烤大虾",
    "category": "barbecue",
    "basePrice": 48,
    "unlockLevel": 4,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_grilled_shrimp_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_oyster",
    "name": "烤生蚝",
    "category": "barbecue",
    "basePrice": 48,
    "unlockLevel": 4,
    "baseDifficulty": 50,
    "defaultRecipeId": "recipe_grilled_oyster_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_scallop",
    "name": "烤扇贝",
    "category": "barbecue",
    "basePrice": 48,
    "unlockLevel": 4,
    "baseDifficulty": 50,
    "defaultRecipeId": "recipe_grilled_scallop_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_eggplant",
    "name": "烤茄子",
    "category": "barbecue",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_grilled_eggplant_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_king_oyster",
    "name": "烤杏鲍菇",
    "category": "barbecue",
    "basePrice": 26,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_grilled_king_oyster_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_shiitake",
    "name": "烤香菇",
    "category": "barbecue",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_grilled_shiitake_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_potato",
    "name": "烤土豆片",
    "category": "barbecue",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_grilled_potato_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_tofu",
    "name": "烤豆腐",
    "category": "barbecue",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_grilled_tofu_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_sea_bass",
    "name": "烤鲈鱼",
    "category": "barbecue",
    "basePrice": 68,
    "unlockLevel": 6,
    "baseDifficulty": 62,
    "defaultRecipeId": "recipe_grilled_sea_bass_standard",
    "tags": [
      "barbecue",
      "roast"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grilled_hairtail",
    "name": "烤带鱼",
    "category": "barbecue",
    "basePrice": 46,
    "unlockLevel": 4,
    "baseDifficulty": 50,
    "defaultRecipeId": "recipe_grilled_hairtail_standard",
    "tags": [
      "barbecue",
      "grill"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "plain_rice_congee",
    "name": "白粥",
    "category": "breakfast",
    "basePrice": 10,
    "unlockLevel": 1,
    "baseDifficulty": 10,
    "defaultRecipeId": "recipe_plain_rice_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "millet_congee",
    "name": "小米粥",
    "category": "breakfast",
    "basePrice": 12,
    "unlockLevel": 1,
    "baseDifficulty": 12,
    "defaultRecipeId": "recipe_millet_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pumpkin_millet_congee",
    "name": "南瓜小米粥",
    "category": "breakfast",
    "basePrice": 14,
    "unlockLevel": 1,
    "baseDifficulty": 14,
    "defaultRecipeId": "recipe_pumpkin_millet_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "date_millet_congee",
    "name": "红枣小米粥",
    "category": "breakfast",
    "basePrice": 14,
    "unlockLevel": 1,
    "baseDifficulty": 14,
    "defaultRecipeId": "recipe_date_millet_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "brown_rice_congee",
    "name": "糙米粥",
    "category": "breakfast",
    "basePrice": 14,
    "unlockLevel": 1,
    "baseDifficulty": 14,
    "defaultRecipeId": "recipe_brown_rice_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "hot_soy_milk",
    "name": "热豆浆",
    "category": "breakfast",
    "basePrice": 10,
    "unlockLevel": 1,
    "baseDifficulty": 10,
    "defaultRecipeId": "recipe_hot_soy_milk_standard",
    "tags": [
      "breakfast",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "steamed_egg",
    "name": "蒸水蛋",
    "category": "breakfast",
    "basePrice": 14,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_steamed_egg_standard",
    "tags": [
      "breakfast",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "boiled_egg",
    "name": "水煮蛋",
    "category": "breakfast",
    "basePrice": 8,
    "unlockLevel": 1,
    "baseDifficulty": 8,
    "defaultRecipeId": "recipe_boiled_egg_standard",
    "tags": [
      "breakfast",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soy_braised_egg",
    "name": "酱香卤蛋",
    "category": "breakfast",
    "basePrice": 10,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_soy_braised_egg_standard",
    "tags": [
      "breakfast",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "century_pork_congee",
    "name": "皮蛋瘦肉粥",
    "category": "breakfast",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_century_pork_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_congee",
    "name": "鸡丝粥",
    "category": "breakfast",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_chicken_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_congee",
    "name": "香菇粥",
    "category": "breakfast",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_mushroom_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "red_bean_congee",
    "name": "红豆粥",
    "category": "breakfast",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_red_bean_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mung_bean_congee",
    "name": "绿豆粥",
    "category": "breakfast",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_mung_bean_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "oat_milk_porridge",
    "name": "牛奶燕麦粥",
    "category": "breakfast",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_oat_milk_porridge_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sweet_potato_congee",
    "name": "红薯粥",
    "category": "breakfast",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_sweet_potato_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "taro_congee",
    "name": "芋头粥",
    "category": "breakfast",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_taro_congee_standard",
    "tags": [
      "breakfast",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "breakfast_egg_pancake",
    "name": "韭菜鸡蛋早餐饼",
    "category": "breakfast",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_breakfast_egg_pancake_standard",
    "tags": [
      "breakfast",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "plain_steamed_bun",
    "name": "原味馒头",
    "category": "breakfast",
    "basePrice": 8,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_plain_steamed_bun_standard",
    "tags": [
      "breakfast",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "breakfast_wonton",
    "name": "紫菜鲜肉馄饨",
    "category": "breakfast",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_breakfast_wonton_standard",
    "tags": [
      "breakfast",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_vegetable_spring_roll",
    "name": "香炸素春卷",
    "category": "snack",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_fried_vegetable_spring_roll_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_chicken_spring_roll",
    "name": "香炸鸡肉春卷",
    "category": "snack",
    "basePrice": 26,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_fried_chicken_spring_roll_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_shrimp_spring_roll",
    "name": "香炸鲜虾春卷",
    "category": "snack",
    "basePrice": 32,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_fried_shrimp_spring_roll_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_pork_wonton",
    "name": "炸鲜肉馄饨",
    "category": "snack",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_fried_pork_wonton_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_shrimp_wonton",
    "name": "炸鲜虾馄饨",
    "category": "snack",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_fried_shrimp_wonton_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pan_fried_pork_dumpling",
    "name": "香煎猪肉饺",
    "category": "snack",
    "basePrice": 26,
    "unlockLevel": 1,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_pan_fried_pork_dumpling_standard",
    "tags": [
      "snack",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pan_fried_beef_dumpling",
    "name": "香煎牛肉饺",
    "category": "snack",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_pan_fried_beef_dumpling_standard",
    "tags": [
      "snack",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "crispy_tofu",
    "name": "香脆豆腐",
    "category": "snack",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_crispy_tofu_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_potato_strips",
    "name": "炸薯条",
    "category": "snack",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 22,
    "defaultRecipeId": "recipe_fried_potato_strips_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_sweet_potato",
    "name": "炸红薯条",
    "category": "snack",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 22,
    "defaultRecipeId": "recipe_fried_sweet_potato_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pumpkin_cake",
    "name": "香煎南瓜饼",
    "category": "snack",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_pumpkin_cake_standard",
    "tags": [
      "snack",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "taro_cake",
    "name": "香煎芋头饼",
    "category": "snack",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_taro_cake_standard",
    "tags": [
      "snack",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sesame_rice_ball",
    "name": "黑芝麻糯米团",
    "category": "snack",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_sesame_rice_ball_standard",
    "tags": [
      "snack",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "red_bean_rice_cake",
    "name": "红豆糯米糕",
    "category": "snack",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_red_bean_rice_cake_standard",
    "tags": [
      "snack",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_popcorn",
    "name": "香酥鸡米花",
    "category": "snack",
    "basePrice": 28,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_chicken_popcorn_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_shrimp",
    "name": "酥炸鲜虾",
    "category": "snack",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_fried_shrimp_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_squid",
    "name": "酥炸鱿鱼圈",
    "category": "snack",
    "basePrice": 34,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_fried_squid_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_oyster",
    "name": "酥炸生蚝",
    "category": "snack",
    "basePrice": 42,
    "unlockLevel": 4,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_fried_oyster_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "candied_apple",
    "name": "拔丝苹果",
    "category": "snack",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_candied_apple_standard",
    "tags": [
      "snack",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "candied_sweet_potato",
    "name": "拔丝红薯",
    "category": "snack",
    "basePrice": 20,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_candied_sweet_potato_standard",
    "tags": [
      "snack",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spiced_peanut",
    "name": "五香花生米",
    "category": "snack",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_spiced_peanut_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sesame_peanut_brittle",
    "name": "芝麻花生酥",
    "category": "snack",
    "basePrice": 20,
    "unlockLevel": 2,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_sesame_peanut_brittle_standard",
    "tags": [
      "snack",
      "pan_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_mushroom",
    "name": "酥炸平菇",
    "category": "snack",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_fried_mushroom_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_lotus_root",
    "name": "香炸藕片",
    "category": "snack",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_fried_lotus_root_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "crispy_banana",
    "name": "脆皮香蕉",
    "category": "snack",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_crispy_banana_standard",
    "tags": [
      "snack",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_cutlet_rice",
    "name": "炸鸡排饭",
    "category": "fast_food",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_chicken_cutlet_rice_standard",
    "tags": [
      "fast_food",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_cutlet_rice",
    "name": "炸猪排饭",
    "category": "fast_food",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_pork_cutlet_rice_standard",
    "tags": [
      "fast_food",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_rice_bowl",
    "name": "酱香牛肉饭",
    "category": "fast_food",
    "basePrice": 36,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_beef_rice_bowl_standard",
    "tags": [
      "fast_food",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soy_chicken_rice",
    "name": "酱汁鸡腿饭",
    "category": "fast_food",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_soy_chicken_rice_standard",
    "tags": [
      "fast_food",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_chicken_wing_combo",
    "name": "炸鸡翅简餐",
    "category": "fast_food",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_fried_chicken_wing_combo_standard",
    "tags": [
      "fast_food",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fried_fish_rice",
    "name": "炸鱼排饭",
    "category": "fast_food",
    "basePrice": 42,
    "unlockLevel": 4,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_fried_fish_rice_standard",
    "tags": [
      "fast_food",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_pepper_chicken_rice",
    "name": "黑椒鸡柳饭",
    "category": "fast_food",
    "basePrice": 32,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_black_pepper_chicken_rice_standard",
    "tags": [
      "fast_food",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chili_beef_rice",
    "name": "鲜椒牛肉饭",
    "category": "fast_food",
    "basePrice": 38,
    "unlockLevel": 3,
    "baseDifficulty": 40,
    "defaultRecipeId": "recipe_chili_beef_rice_standard",
    "tags": [
      "fast_food",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mushroom_pork_rice",
    "name": "香菇肉片饭",
    "category": "fast_food",
    "basePrice": 30,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_mushroom_pork_rice_standard",
    "tags": [
      "fast_food",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tofu_rice_bowl",
    "name": "酱烧豆腐饭",
    "category": "fast_food",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_tofu_rice_bowl_standard",
    "tags": [
      "fast_food",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "eggplant_rice_bowl",
    "name": "酱香茄子饭",
    "category": "fast_food",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_eggplant_rice_bowl_standard",
    "tags": [
      "fast_food",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_rice_bowl",
    "name": "鲜虾蔬菜饭",
    "category": "fast_food",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_shrimp_rice_bowl_standard",
    "tags": [
      "fast_food",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "duck_rice_bowl",
    "name": "酱鸭饭",
    "category": "fast_food",
    "basePrice": 36,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_duck_rice_bowl_standard",
    "tags": [
      "fast_food",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cumin_lamb_fast_rice",
    "name": "孜然羊肉快餐饭",
    "category": "fast_food",
    "basePrice": 40,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_cumin_lamb_fast_rice_standard",
    "tags": [
      "fast_food",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "vegetable_egg_rice",
    "name": "时蔬鸡蛋饭",
    "category": "fast_food",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_vegetable_egg_rice_standard",
    "tags": [
      "fast_food",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_home_set",
    "name": "家常肉片套餐",
    "category": "set_meal",
    "basePrice": 38,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_pork_home_set_standard",
    "tags": [
      "set_meal",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "chicken_home_set",
    "name": "鸡腿时蔬套餐",
    "category": "set_meal",
    "basePrice": 42,
    "unlockLevel": 2,
    "baseDifficulty": 38,
    "defaultRecipeId": "recipe_chicken_home_set_standard",
    "tags": [
      "set_meal",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "beef_home_set",
    "name": "黑椒牛肉套餐",
    "category": "set_meal",
    "basePrice": 48,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_beef_home_set_standard",
    "tags": [
      "set_meal",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lamb_home_set",
    "name": "孜然羊肉套餐",
    "category": "set_meal",
    "basePrice": 50,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_lamb_home_set_standard",
    "tags": [
      "set_meal",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "fish_home_set",
    "name": "鲜鱼时蔬套餐",
    "category": "set_meal",
    "basePrice": 52,
    "unlockLevel": 4,
    "baseDifficulty": 48,
    "defaultRecipeId": "recipe_fish_home_set_standard",
    "tags": [
      "set_meal",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "shrimp_home_set",
    "name": "鲜虾鸡蛋套餐",
    "category": "set_meal",
    "basePrice": 48,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_shrimp_home_set_standard",
    "tags": [
      "set_meal",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tofu_home_set",
    "name": "豆腐菌菇套餐",
    "category": "set_meal",
    "basePrice": 34,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_tofu_home_set_standard",
    "tags": [
      "set_meal",
      "stew"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "duck_home_set",
    "name": "鸭腿时蔬套餐",
    "category": "set_meal",
    "basePrice": 48,
    "unlockLevel": 3,
    "baseDifficulty": 46,
    "defaultRecipeId": "recipe_duck_home_set_standard",
    "tags": [
      "set_meal",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pork_rib_set",
    "name": "排骨时蔬套餐",
    "category": "set_meal",
    "basePrice": 52,
    "unlockLevel": 4,
    "baseDifficulty": 50,
    "defaultRecipeId": "recipe_pork_rib_set_standard",
    "tags": [
      "set_meal",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "seafood_set",
    "name": "海鲜时蔬套餐",
    "category": "set_meal",
    "basePrice": 58,
    "unlockLevel": 5,
    "baseDifficulty": 56,
    "defaultRecipeId": "recipe_seafood_set_standard",
    "tags": [
      "set_meal",
      "stir_fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "red_bean_soup",
    "name": "红豆甜汤",
    "category": "dessert",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_red_bean_soup_standard",
    "tags": [
      "dessert",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mung_bean_soup",
    "name": "绿豆甜汤",
    "category": "dessert",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_mung_bean_soup_standard",
    "tags": [
      "dessert",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "tremella_date_soup",
    "name": "红枣银耳羹",
    "category": "dessert",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 26,
    "defaultRecipeId": "recipe_tremella_date_soup_standard",
    "tags": [
      "dessert",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lotus_lily_soup",
    "name": "莲子百合羹",
    "category": "dessert",
    "basePrice": 24,
    "unlockLevel": 2,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_lotus_lily_soup_standard",
    "tags": [
      "dessert",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "longan_date_soup",
    "name": "桂圆红枣甜汤",
    "category": "dessert",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_longan_date_soup_standard",
    "tags": [
      "dessert",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "milk_pudding",
    "name": "牛奶布丁",
    "category": "dessert",
    "basePrice": 20,
    "unlockLevel": 2,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_milk_pudding_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mango_pudding",
    "name": "芒果布丁",
    "category": "dessert",
    "basePrice": 24,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_mango_pudding_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "strawberry_pudding",
    "name": "草莓布丁",
    "category": "dessert",
    "basePrice": 24,
    "unlockLevel": 2,
    "baseDifficulty": 32,
    "defaultRecipeId": "recipe_strawberry_pudding_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "yogurt_fruit_cup",
    "name": "酸奶水果杯",
    "category": "dessert",
    "basePrice": 26,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_yogurt_fruit_cup_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mango_yogurt_cup",
    "name": "芒果酸奶杯",
    "category": "dessert",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 22,
    "defaultRecipeId": "recipe_mango_yogurt_cup_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "black_sesame_paste",
    "name": "黑芝麻糊",
    "category": "dessert",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 26,
    "defaultRecipeId": "recipe_black_sesame_paste_standard",
    "tags": [
      "dessert",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "red_bean_glutinous_rice",
    "name": "红豆糯米甜饭",
    "category": "dessert",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_red_bean_glutinous_rice_standard",
    "tags": [
      "dessert",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sweet_potato_milk",
    "name": "红薯牛奶羹",
    "category": "dessert",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_sweet_potato_milk_standard",
    "tags": [
      "dessert",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pumpkin_milk",
    "name": "南瓜牛奶羹",
    "category": "dessert",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 24,
    "defaultRecipeId": "recipe_pumpkin_milk_standard",
    "tags": [
      "dessert",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "taro_coconut",
    "name": "香芋椰奶羹",
    "category": "dessert",
    "basePrice": 24,
    "unlockLevel": 2,
    "baseDifficulty": 28,
    "defaultRecipeId": "recipe_taro_coconut_standard",
    "tags": [
      "dessert",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "banana_yogurt",
    "name": "香蕉酸奶杯",
    "category": "dessert",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_banana_yogurt_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "strawberry_yogurt",
    "name": "草莓酸奶杯",
    "category": "dessert",
    "basePrice": 24,
    "unlockLevel": 1,
    "baseDifficulty": 22,
    "defaultRecipeId": "recipe_strawberry_yogurt_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "apple_yogurt",
    "name": "苹果酸奶杯",
    "category": "dessert",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 20,
    "defaultRecipeId": "recipe_apple_yogurt_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "watermelon_jelly",
    "name": "西瓜果冻",
    "category": "dessert",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_watermelon_jelly_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grape_jelly",
    "name": "葡萄果冻",
    "category": "dessert",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 30,
    "defaultRecipeId": "recipe_grape_jelly_standard",
    "tags": [
      "dessert",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lemon_water",
    "name": "鲜柠檬水",
    "category": "beverage",
    "basePrice": 12,
    "unlockLevel": 1,
    "baseDifficulty": 10,
    "defaultRecipeId": "recipe_lemon_water_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lime_soda",
    "name": "青柠苏打",
    "category": "beverage",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 12,
    "defaultRecipeId": "recipe_lime_soda_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "orange_fizz",
    "name": "橙香气泡饮",
    "category": "beverage",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 14,
    "defaultRecipeId": "recipe_orange_fizz_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "apple_fizz",
    "name": "苹果气泡饮",
    "category": "beverage",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 14,
    "defaultRecipeId": "recipe_apple_fizz_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "strawberry_yogurt_drink",
    "name": "草莓酸奶饮",
    "category": "beverage",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_strawberry_yogurt_drink_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mango_milk",
    "name": "芒果牛奶",
    "category": "beverage",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_mango_milk_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "banana_milk",
    "name": "香蕉牛奶",
    "category": "beverage",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 16,
    "defaultRecipeId": "recipe_banana_milk_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "soy_milk_drink",
    "name": "原味豆浆",
    "category": "beverage",
    "basePrice": 10,
    "unlockLevel": 1,
    "baseDifficulty": 10,
    "defaultRecipeId": "recipe_soy_milk_drink_standard",
    "tags": [
      "beverage",
      "boil"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lemon_green_tea",
    "name": "柠檬绿茶",
    "category": "beverage",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 14,
    "defaultRecipeId": "recipe_lemon_green_tea_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "lemon_black_tea",
    "name": "柠檬红茶",
    "category": "beverage",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 14,
    "defaultRecipeId": "recipe_lemon_black_tea_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mango_coconut",
    "name": "芒果椰奶",
    "category": "beverage",
    "basePrice": 22,
    "unlockLevel": 1,
    "baseDifficulty": 18,
    "defaultRecipeId": "recipe_mango_coconut_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "grape_soda",
    "name": "葡萄苏打",
    "category": "beverage",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 14,
    "defaultRecipeId": "recipe_grape_soda_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "watermelon_juice",
    "name": "西瓜鲜饮",
    "category": "beverage",
    "basePrice": 18,
    "unlockLevel": 1,
    "baseDifficulty": 12,
    "defaultRecipeId": "recipe_watermelon_juice_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pear_drink",
    "name": "鲜梨饮",
    "category": "beverage",
    "basePrice": 16,
    "unlockLevel": 1,
    "baseDifficulty": 16,
    "defaultRecipeId": "recipe_pear_drink_standard",
    "tags": [
      "beverage",
      "simmer"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "orange_apple_mix",
    "name": "橙苹果混合果饮",
    "category": "beverage",
    "basePrice": 20,
    "unlockLevel": 1,
    "baseDifficulty": 16,
    "defaultRecipeId": "recipe_orange_apple_mix_standard",
    "tags": [
      "beverage",
      "raw_prepare"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "butter_cookie",
    "name": "黄油曲奇",
    "category": "bakery",
    "basePrice": 22,
    "unlockLevel": 2,
    "baseDifficulty": 34,
    "defaultRecipeId": "recipe_butter_cookie_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sesame_cookie",
    "name": "黑芝麻曲奇",
    "category": "bakery",
    "basePrice": 24,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_sesame_cookie_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "peanut_cookie",
    "name": "花生酥饼",
    "category": "bakery",
    "basePrice": 24,
    "unlockLevel": 2,
    "baseDifficulty": 36,
    "defaultRecipeId": "recipe_peanut_cookie_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sponge_cake",
    "name": "原味海绵蛋糕",
    "category": "bakery",
    "basePrice": 28,
    "unlockLevel": 3,
    "baseDifficulty": 42,
    "defaultRecipeId": "recipe_sponge_cake_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "banana_cake",
    "name": "香蕉蛋糕",
    "category": "bakery",
    "basePrice": 30,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_banana_cake_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "carrot_cake",
    "name": "胡萝卜蛋糕",
    "category": "bakery",
    "basePrice": 30,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_carrot_cake_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "pumpkin_cake_baked",
    "name": "南瓜蛋糕",
    "category": "bakery",
    "basePrice": 30,
    "unlockLevel": 3,
    "baseDifficulty": 44,
    "defaultRecipeId": "recipe_pumpkin_cake_baked_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "cheese_cake",
    "name": "烤芝士蛋糕",
    "category": "bakery",
    "basePrice": 38,
    "unlockLevel": 4,
    "baseDifficulty": 52,
    "defaultRecipeId": "recipe_cheese_cake_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "strawberry_cake",
    "name": "草莓奶油蛋糕",
    "category": "bakery",
    "basePrice": 40,
    "unlockLevel": 4,
    "baseDifficulty": 52,
    "defaultRecipeId": "recipe_strawberry_cake_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "mango_cake",
    "name": "芒果奶油蛋糕",
    "category": "bakery",
    "basePrice": 40,
    "unlockLevel": 4,
    "baseDifficulty": 52,
    "defaultRecipeId": "recipe_mango_cake_standard",
    "tags": [
      "bakery",
      "bake"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "braised_trotter",
    "name": "红烧猪蹄",
    "category": "specialty",
    "basePrice": 48,
    "unlockLevel": 4,
    "baseDifficulty": 54,
    "defaultRecipeId": "recipe_braised_trotter_standard",
    "tags": [
      "specialty",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "spiced_beef_shank",
    "name": "五香牛腱",
    "category": "specialty",
    "basePrice": 58,
    "unlockLevel": 5,
    "baseDifficulty": 58,
    "defaultRecipeId": "recipe_spiced_beef_shank_standard",
    "tags": [
      "specialty",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "braised_duck",
    "name": "酱烧全鸭",
    "category": "specialty",
    "basePrice": 68,
    "unlockLevel": 6,
    "baseDifficulty": 62,
    "defaultRecipeId": "recipe_braised_duck_standard",
    "tags": [
      "specialty",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "roast_goose",
    "name": "五香烤鹅",
    "category": "specialty",
    "basePrice": 88,
    "unlockLevel": 7,
    "baseDifficulty": 70,
    "defaultRecipeId": "recipe_roast_goose_standard",
    "tags": [
      "specialty",
      "roast"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "roast_pigeon",
    "name": "脆皮乳鸽",
    "category": "specialty",
    "basePrice": 68,
    "unlockLevel": 6,
    "baseDifficulty": 66,
    "defaultRecipeId": "recipe_roast_pigeon_standard",
    "tags": [
      "specialty",
      "roast"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "steamed_mandarin_fish",
    "name": "清蒸鳜鱼",
    "category": "specialty",
    "basePrice": 88,
    "unlockLevel": 7,
    "baseDifficulty": 72,
    "defaultRecipeId": "recipe_steamed_mandarin_fish_standard",
    "tags": [
      "specialty",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sweet_sour_mandarin_fish",
    "name": "糖醋鳜鱼",
    "category": "specialty",
    "basePrice": 98,
    "unlockLevel": 8,
    "baseDifficulty": 78,
    "defaultRecipeId": "recipe_sweet_sour_mandarin_fish_standard",
    "tags": [
      "specialty",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "braised_sea_cucumber",
    "name": "红烧海参",
    "category": "specialty",
    "basePrice": 118,
    "unlockLevel": 8,
    "baseDifficulty": 80,
    "defaultRecipeId": "recipe_braised_sea_cucumber_standard",
    "tags": [
      "specialty",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "braised_abalone",
    "name": "鲍鱼烧香菇",
    "category": "specialty",
    "basePrice": 128,
    "unlockLevel": 9,
    "baseDifficulty": 82,
    "defaultRecipeId": "recipe_braised_abalone_standard",
    "tags": [
      "specialty",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "steamed_crab",
    "name": "清蒸大闸蟹",
    "category": "specialty",
    "basePrice": 108,
    "unlockLevel": 7,
    "baseDifficulty": 70,
    "defaultRecipeId": "recipe_steamed_crab_standard",
    "tags": [
      "specialty",
      "steam"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "salt_pepper_prawn",
    "name": "椒香大虾",
    "category": "specialty",
    "basePrice": 68,
    "unlockLevel": 5,
    "baseDifficulty": 60,
    "defaultRecipeId": "recipe_salt_pepper_prawn_standard",
    "tags": [
      "specialty",
      "fry"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "braised_hairtail",
    "name": "红烧带鱼",
    "category": "specialty",
    "basePrice": 58,
    "unlockLevel": 5,
    "baseDifficulty": 58,
    "defaultRecipeId": "recipe_braised_hairtail_standard",
    "tags": [
      "specialty",
      "braise"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "smoked_duck_breast",
    "name": "烟熏鸭胸",
    "category": "specialty",
    "basePrice": 72,
    "unlockLevel": 7,
    "baseDifficulty": 72,
    "defaultRecipeId": "recipe_smoked_duck_breast_standard",
    "tags": [
      "specialty",
      "smoke"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "sous_vide_beef",
    "name": "低温黑椒牛柳",
    "category": "specialty",
    "basePrice": 88,
    "unlockLevel": 8,
    "baseDifficulty": 76,
    "defaultRecipeId": "recipe_sous_vide_beef_standard",
    "tags": [
      "specialty",
      "sous_vide"
    ]
  },
  {
    "schemaVersion": 1,
    "id": "seafood_grand_plate",
    "name": "海味四鲜拼盘",
    "category": "specialty",
    "basePrice": 168,
    "unlockLevel": 10,
    "baseDifficulty": 88,
    "defaultRecipeId": "recipe_seafood_grand_plate_standard",
    "tags": [
      "specialty",
      "steam"
    ]
  }
]);
