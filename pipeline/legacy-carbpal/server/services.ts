// Fallback search databases to provide rich offline/keyless standalone experience
export interface FoodItem {
  id: string;
  name: string;
  category: "Fruits" | "Vegetables" | "Nuts/Seeds" | "Grains/Snacks" | "Other";
  carbRatio: number; // Carbs per gram (e.g. 0.15 = 15g carbs per 100g)
  servingSize?: string;
  servingCarbs?: number;
  isBranded?: boolean;
}

export const FALLBACK_USDA_FOODS: FoodItem[] = [
  { id: "usda-1", name: "Almonds butter", category: "Nuts/Seeds", carbRatio: 0.13 },
  { id: "usda-2", name: "Almonds dry roasted", category: "Nuts/Seeds", carbRatio: 0.16 },
  { id: "usda-3", name: "Almonds honey roasted", category: "Nuts/Seeds", carbRatio: 0.21 },
  { id: "usda-4", name: "Almonds paste", category: "Nuts/Seeds", carbRatio: 0.44 },
  { id: "usda-5", name: "Animal crackers", category: "Grains/Snacks", carbRatio: 0.73 },
  { id: "usda-6", name: "Apples", category: "Fruits", carbRatio: 0.13 },
  { id: "usda-7", name: "Apples dried", category: "Fruits", carbRatio: 0.62 },
  { id: "usda-8", name: "Applesauce sweetened", category: "Fruits", carbRatio: 0.19 },
  { id: "usda-9", name: "Applesauce unsweetened", category: "Fruits", carbRatio: 0.11 },
  { id: "usda-10", name: "Apricots", category: "Fruits", carbRatio: 0.10 },
  { id: "usda-11", name: "Apricots dried", category: "Fruits", carbRatio: 0.59 },
  { id: "usda-12", name: "Artichokes", category: "Vegetables", carbRatio: 0.08 },
  { id: "usda-13", name: "Arugula", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-14", name: "Asparagus", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-15", name: "Avocados", category: "Vegetables", carbRatio: 0.05 },
  { id: "usda-16", name: "Baked beans", category: "Other", carbRatio: 0.19 },
  { id: "usda-17", name: "Baked beans canned", category: "Other", carbRatio: 0.18 },
  { id: "usda-18", name: "Baked beans with franks", category: "Other", carbRatio: 0.12 },
  { id: "usda-19", name: "Banana bread", category: "Grains/Snacks", carbRatio: 0.54 },
  { id: "usda-20", name: "Banana peppers", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-21", name: "Bananas", category: "Fruits", carbRatio: 0.22 },
  { id: "usda-22", name: "Bananas dried", category: "Fruits", carbRatio: 0.83 },
  { id: "usda-23", name: "Biscuits", category: "Grains/Snacks", carbRatio: 0.48 },
  { id: "usda-24", name: "Biscuits reduced fat", category: "Grains/Snacks", carbRatio: 0.54 },
  { id: "usda-25", name: "Black beans", category: "Other", carbRatio: 0.18 },
  { id: "usda-26", name: "Blackberries", category: "Fruits", carbRatio: 0.07 },
  { id: "usda-27", name: "Blackberries frozen", category: "Fruits", carbRatio: 0.13 },
  { id: "usda-28", name: "Blueberries", category: "Fruits", carbRatio: 0.13 },
  { id: "usda-29", name: "Blueberries frozen sweetened", category: "Fruits", carbRatio: 0.21 },
  { id: "usda-30", name: "Blueberries frozen unsweetened", category: "Fruits", carbRatio: 0.11 },
  { id: "usda-31", name: "Bread sticks", category: "Grains/Snacks", carbRatio: 0.67 },
  { id: "usda-32", name: "Bread stuffing", category: "Grains/Snacks", carbRatio: 0.20 },
  { id: "usda-33", name: "Broccoli", category: "Vegetables", carbRatio: 0.05 },
  { id: "usda-34", name: "Broccoli cooked", category: "Vegetables", carbRatio: 0.06 },
  { id: "usda-35", name: "Brownies", category: "Grains/Snacks", carbRatio: 0.65 },
  { id: "usda-36", name: "Brussels sprouts", category: "Vegetables", carbRatio: 0.06 },
  { id: "usda-37", name: "Buns", category: "Grains/Snacks", carbRatio: 0.49 },
  { id: "usda-38", name: "Butter cookies", category: "Grains/Snacks", carbRatio: 0.68 },
  { id: "usda-39", name: "Butterscotch candies", category: "Other", carbRatio: 0.90 },
  { id: "usda-40", name: "Cantaloupe", category: "Fruits", carbRatio: 0.08 },
  { id: "usda-41", name: "Carrot cake frosted", category: "Grains/Snacks", carbRatio: 0.53 },
  { id: "usda-42", name: "Carrot cake unfrosted", category: "Grains/Snacks", carbRatio: 0.49 },
  { id: "usda-43", name: "Carrots", category: "Vegetables", carbRatio: 0.08 },
  { id: "usda-44", name: "Carrots cooked", category: "Vegetables", carbRatio: 0.07 },
  { id: "usda-45", name: "Cashews dry roasted", category: "Nuts/Seeds", carbRatio: 0.30 },
  { id: "usda-46", name: "Cauliflower", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-47", name: "Cauliflower cooked", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-48", name: "Celery", category: "Vegetables", carbRatio: 0.02 },
  { id: "usda-49", name: "Cheesecake", category: "Other", carbRatio: 0.25 },
  { id: "usda-50", name: "Cheesecake no-bake", category: "Other", carbRatio: 0.34 },
  { id: "usda-51", name: "Cherries sour", category: "Fruits", carbRatio: 0.11 },
  { id: "usda-52", name: "Cherries sweet", category: "Fruits", carbRatio: 0.15 },
  { id: "usda-53", name: "Chocolate cake frosted", category: "Grains/Snacks", carbRatio: 0.62 },
  { id: "usda-54", name: "Chocolate cake unfrosted", category: "Grains/Snacks", carbRatio: 0.50 },
  { id: "usda-55", name: "Chocolate chip cookies", category: "Grains/Snacks", carbRatio: 0.58 },
  { id: "usda-56", name: "Chocolate chip cookies reduced-fat", category: "Grains/Snacks", carbRatio: 0.70 },
  { id: "usda-57", name: "Chocolate wafers", category: "Grains/Snacks", carbRatio: 0.69 },
  { id: "usda-58", name: "Chocolate-covered peanuts", category: "Other", carbRatio: 0.47 },
  { id: "usda-59", name: "Chocolate-covered raisins", category: "Other", carbRatio: 0.69 },
  { id: "usda-60", name: "Coconut macaroons", category: "Grains/Snacks", carbRatio: 0.70 },
  { id: "usda-61", name: "Coffee cake", category: "Grains/Snacks", carbRatio: 0.48 },
  { id: "usda-62", name: "Coffee cake cheese", category: "Grains/Snacks", carbRatio: 0.43 },
  { id: "usda-63", name: "Coffee cake creme-filled", category: "Grains/Snacks", carbRatio: 0.52 },
  { id: "usda-64", name: "Coffee cake fruit", category: "Grains/Snacks", carbRatio: 0.49 },
  { id: "usda-65", name: "Coleslaw", category: "Other", carbRatio: 0.12 },
  { id: "usda-66", name: "Collards", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-67", name: "Corn", category: "Vegetables", carbRatio: 0.21 },
  { id: "usda-68", name: "Cornbread", category: "Grains/Snacks", carbRatio: 0.47 },
  { id: "usda-69", name: "Cornbread stuffing", category: "Grains/Snacks", carbRatio: 0.20 },
  { id: "usda-70", name: "Cornmeal", category: "Grains/Snacks", carbRatio: 0.77 },
  { id: "usda-71", name: "Cornstarch", category: "Grains/Snacks", carbRatio: 0.91 },
  { id: "usda-72", name: "Couscous cooked", category: "Grains/Snacks", carbRatio: 0.22 },
  { id: "usda-73", name: "Crabapples", category: "Fruits", carbRatio: 0.20 },
  { id: "usda-74", name: "Cranberries", category: "Fruits", carbRatio: 0.10 },
  { id: "usda-75", name: "Cranberries dried", category: "Fruits", carbRatio: 0.80 },
  { id: "usda-76", name: "Cranberries sauce", category: "Fruits", carbRatio: 0.38 },
  { id: "usda-77", name: "Cream puffs", category: "Other", carbRatio: 0.37 },
  { id: "usda-78", name: "Croissants", category: "Grains/Snacks", carbRatio: 0.43 },
  { id: "usda-79", name: "Croissants apple", category: "Grains/Snacks", carbRatio: 0.35 },
  { id: "usda-80", name: "Croissants cheese", category: "Grains/Snacks", carbRatio: 0.45 },
  { id: "usda-81", name: "Croutons plain", category: "Grains/Snacks", carbRatio: 0.71 },
  { id: "usda-82", name: "Croutons seasoned", category: "Grains/Snacks", carbRatio: 0.60 },
  { id: "usda-83", name: "Cucumber", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-84", name: "Currants black", category: "Fruits", carbRatio: 0.15 },
  { id: "usda-85", name: "Currants dried", category: "Fruits", carbRatio: 0.71 },
  { id: "usda-86", name: "Currants red", category: "Fruits", carbRatio: 0.12 },
  { id: "usda-87", name: "Currants white", category: "Fruits", carbRatio: 0.12 },
  { id: "usda-88", name: "Danish pastry cheese", category: "Grains/Snacks", carbRatio: 0.32 },
  { id: "usda-89", name: "Danish pastry cinnamon/nut", category: "Grains/Snacks", carbRatio: 0.44 },
  { id: "usda-90", name: "Danish pastry fruit-filled", category: "Grains/Snacks", carbRatio: 0.48 },
  { id: "usda-91", name: "Dates", category: "Fruits", carbRatio: 0.71 },
  { id: "usda-92", name: "Dinner rolls wheat", category: "Grains/Snacks", carbRatio: 0.44 },
  { id: "usda-93", name: "Dinner rolls white", category: "Grains/Snacks", carbRatio: 0.51 },
  { id: "usda-94", name: "Doughnuts chocolate cake glazed", category: "Grains/Snacks", carbRatio: 0.52 },
  { id: "usda-95", name: "Doughnuts creme-filled", category: "Grains/Snacks", carbRatio: 0.29 },
  { id: "usda-96", name: "Doughnuts French crullers", category: "Grains/Snacks", carbRatio: 0.58 },
  { id: "usda-97", name: "Doughnuts glazed/frosted", category: "Grains/Snacks", carbRatio: 0.49 },
  { id: "usda-98", name: "Doughnuts jelly-filled", category: "Grains/Snacks", carbRatio: 0.39 },
  { id: "usda-99", name: "Doughnuts plain cake", category: "Grains/Snacks", carbRatio: 0.44 },
  { id: "usda-100", name: "Eclairs", category: "Other", carbRatio: 0.37 },
  { id: "usda-101", name: "Egg bread", category: "Grains/Snacks", carbRatio: 0.47 },
  { id: "usda-102", name: "Egg custard", category: "Other", carbRatio: 0.17 },
  { id: "usda-103", name: "Eggplant", category: "Vegetables", carbRatio: 0.07 },
  { id: "usda-104", name: "English muffins", category: "Grains/Snacks", carbRatio: 0.44 },
  { id: "usda-105", name: "English muffins cinnamon-raisin", category: "Grains/Snacks", carbRatio: 0.47 },
  { id: "usda-106", name: "English muffins whole wheat", category: "Grains/Snacks", carbRatio: 0.37 },
  { id: "usda-107", name: "Falafel", category: "Other", carbRatio: 0.32 },
  { id: "usda-108", name: "Fava beans", category: "Vegetables", carbRatio: 0.17 },
  { id: "usda-109", name: "Fig bars", category: "Grains/Snacks", carbRatio: 0.68 },
  { id: "usda-110", name: "Figs", category: "Fruits", carbRatio: 0.18 },
  { id: "usda-111", name: "Figs dried", category: "Fruits", carbRatio: 0.59 },
  { id: "usda-112", name: "Figs stewed", category: "Fruits", carbRatio: 0.25 },
  { id: "usda-113", name: "Flan", category: "Other", carbRatio: 0.18 },
  { id: "usda-114", name: "Flaxseed", category: "Nuts/Seeds", carbRatio: 0.02 },
  { id: "usda-115", name: "Fortune cookies", category: "Grains/Snacks", carbRatio: 0.82 },
  { id: "usda-116", name: "French bread", category: "Grains/Snacks", carbRatio: 0.55 },
  { id: "usda-117", name: "French toast", category: "Grains/Snacks", carbRatio: 0.25 },
  { id: "usda-118", name: "Fruit butters", category: "Fruits", carbRatio: 0.42 },
  { id: "usda-119", name: "Fruit leather", category: "Fruits", carbRatio: 0.86 },
  { id: "usda-120", name: "Fruitcake", category: "Grains/Snacks", carbRatio: 0.58 },
  { id: "usda-121", name: "Fudge", category: "Other", carbRatio: 0.75 },
  { id: "usda-122", name: "Fudge chocolate & nuts", category: "Other", carbRatio: 0.65 },
  { id: "usda-123", name: "Fudge marshmallow", category: "Other", carbRatio: 0.70 },
  { id: "usda-124", name: "Fudge peanut butter", category: "Other", carbRatio: 0.77 },
  { id: "usda-125", name: "Fudge vanilla", category: "Other", carbRatio: 0.82 },
  { id: "usda-126", name: "Fudge vanilla & nuts", category: "Other", carbRatio: 0.74 },
  { id: "usda-127", name: "Garbanzo beans", category: "Vegetables", carbRatio: 0.23 },
  { id: "usda-128", name: "Gelatin", category: "Other", carbRatio: 0.14 },
  { id: "usda-129", name: "Gingerbread", category: "Grains/Snacks", carbRatio: 0.49 },
  { id: "usda-130", name: "Gingersnaps", category: "Grains/Snacks", carbRatio: 0.75 },
  { id: "usda-131", name: "Gourd", category: "Vegetables", carbRatio: 0.05 },
  { id: "usda-132", name: "Graham crackers", category: "Grains/Snacks", carbRatio: 0.74 },
  { id: "usda-133", name: "Grapefruit", category: "Fruits", carbRatio: 0.10 },
  { id: "usda-134", name: "Grapes", category: "Fruits", carbRatio: 0.18 },
  { id: "usda-135", name: "Great northern beans", category: "Vegetables", carbRatio: 0.18 },
  { id: "usda-136", name: "Green beans", category: "Vegetables", carbRatio: 0.05 },
  { id: "usda-137", name: "Green beans canned", category: "Vegetables", carbRatio: 0.02 },
  { id: "usda-138", name: "Green peppers", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-139", name: "Guavas", category: "Fruits", carbRatio: 0.12 },
  { id: "usda-140", name: "Hard candies", category: "Other", carbRatio: 0.98 },
  { id: "usda-141", name: "Hazelnuts", category: "Nuts/Seeds", carbRatio: 0.11 },
  { id: "usda-142", name: "Hearts of palm", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-143", name: "Hickorynuts", category: "Nuts/Seeds", carbRatio: 0.15 },
  { id: "usda-144", name: "Hominy", category: "Vegetables", carbRatio: 0.13 },
  { id: "usda-145", name: "Honeydew", category: "Fruits", carbRatio: 0.09 },
  { id: "usda-146", name: "Hummus", category: "Other", carbRatio: 0.11 },
  { id: "usda-147", name: "Hummus home-made", category: "Other", carbRatio: 0.18 },
  { id: "usda-148", name: "Ice cream cones cake/wafer", category: "Other", carbRatio: 0.76 },
  { id: "usda-149", name: "Ice cream cones sugar", category: "Other", carbRatio: 0.82 },
  { id: "usda-150", name: "Italian bread", category: "Grains/Snacks", carbRatio: 0.49 },
  { id: "usda-151", name: "Jalapeno peppers", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-152", name: "Jellybeans", category: "Other", carbRatio: 0.93 },
  { id: "usda-153", name: "Kaiser rolls", category: "Grains/Snacks", carbRatio: 0.50 },
  { id: "usda-154", name: "Kale", category: "Vegetables", carbRatio: 0.09 },
  { id: "usda-155", name: "Kale cooked", category: "Vegetables", carbRatio: 0.05 },
  { id: "usda-156", name: "Kidney beans", category: "Vegetables", carbRatio: 0.20 },
  { id: "usda-157", name: "Kiwifruit", category: "Fruits", carbRatio: 0.13 },
  { id: "usda-158", name: "Kumquat", category: "Fruits", carbRatio: 0.13 },
  { id: "usda-159", name: "Ladyfingers", category: "Grains/Snacks", carbRatio: 0.59 },
  { id: "usda-160", name: "Lasagna meat", category: "Other", carbRatio: 0.17 },
  { id: "usda-161", name: "Lasagna vegetable", category: "Other", carbRatio: 0.17 },
  { id: "usda-162", name: "Leeks", category: "Vegetables", carbRatio: 0.13 },
  { id: "usda-163", name: "Lemons", category: "Fruits", carbRatio: 0.08 },
  { id: "usda-164", name: "Lentils seeds cooked", category: "Vegetables", carbRatio: 0.16 },
  { id: "usda-165", name: "Lentils seeds raw", category: "Vegetables", carbRatio: 0.54 },
  { id: "usda-166", name: "Lentils sprouts cooked", category: "Vegetables", carbRatio: 0.21 },
  { id: "usda-167", name: "Lentils sprouts raw", category: "Vegetables", carbRatio: 0.22 },
  { id: "usda-168", name: "Lettuce iceberg", category: "Vegetables", carbRatio: 0.02 },
  { id: "usda-169", name: "Lettuce romaine", category: "Vegetables", carbRatio: 0.02 },
  { id: "usda-170", name: "Lima beans", category: "Vegetables", carbRatio: 0.18 },
  { id: "usda-171", name: "Limes", category: "Fruits", carbRatio: 0.09 },
  { id: "usda-172", name: "Macadamia nuts", category: "Nuts/Seeds", carbRatio: 0.09 },
  { id: "usda-173", name: "Macaroni & cheese", category: "Grains/Snacks", carbRatio: 0.21 },
  { id: "usda-174", name: "Mandarin oranges", category: "Fruits", carbRatio: 0.12 },
  { id: "usda-175", name: "Mangoes", category: "Fruits", carbRatio: 0.16 },
  { id: "usda-176", name: "Marshmallow topping", category: "Other", carbRatio: 0.79 },
  { id: "usda-177", name: "Marshmallows", category: "Other", carbRatio: 0.81 },
  { id: "usda-178", name: "Mixed fruit canned light syrup", category: "Fruits", carbRatio: 0.14 },
  { id: "usda-179", name: "Mixed fruit dried", category: "Fruits", carbRatio: 0.60 },
  { id: "usda-180", name: "Mixed nuts", category: "Nuts/Seeds", carbRatio: 0.18 },
  { id: "usda-181", name: "Mixed nuts dry roasted", category: "Nuts/Seeds", carbRatio: 0.21 },
  { id: "usda-182", name: "Mixed veggies", category: "Vegetables", carbRatio: 0.11 },
  { id: "usda-183", name: "Mixed veggies canned", category: "Vegetables", carbRatio: 0.08 },
  { id: "usda-184", name: "Molasses cookies", category: "Grains/Snacks", carbRatio: 0.73 },
  { id: "usda-185", name: "Muffins banana", category: "Grains/Snacks", carbRatio: 0.45 },
  { id: "usda-186", name: "Muffins blueberry", category: "Grains/Snacks", carbRatio: 0.41 },
  { id: "usda-187", name: "Muffins chocolate chip", category: "Grains/Snacks", carbRatio: 0.44 },
  { id: "usda-188", name: "Muffins corn", category: "Grains/Snacks", carbRatio: 0.44 },
  { id: "usda-189", name: "Muffins lemon poppyseed", category: "Grains/Snacks", carbRatio: 0.46 },
  { id: "usda-190", name: "Muffins oat bran", category: "Grains/Snacks", carbRatio: 0.44 },
  { id: "usda-191", name: "Muffins pumpkin", category: "Grains/Snacks", carbRatio: 0.57 },
  { id: "usda-192", name: "Mushrooms", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-193", name: "Navy beans", category: "Vegetables", carbRatio: 0.21 },
  { id: "usda-194", name: "Nectarines", category: "Fruits", carbRatio: 0.10 },
  { id: "usda-195", name: "Noodles chow mein cooked", category: "Grains/Snacks", carbRatio: 0.56 },
  { id: "usda-196", name: "Noodles corn cooked", category: "Grains/Snacks", carbRatio: 0.23 },
  { id: "usda-197", name: "Noodles egg cooked", category: "Grains/Snacks", carbRatio: 0.24 },
  { id: "usda-198", name: "Noodles Japanese cooked", category: "Grains/Snacks", carbRatio: 0.28 },
  { id: "usda-199", name: "Noodles macaroni cooked", category: "Grains/Snacks", carbRatio: 0.29 },
  { id: "usda-200", name: "Noodles rice cooked", category: "Grains/Snacks", carbRatio: 0.24 },
  { id: "usda-201", name: "Noodles spaghetti cooked", category: "Grains/Snacks", carbRatio: 0.29 },
  { id: "usda-202", name: "Noodles spinach cooked", category: "Grains/Snacks", carbRatio: 0.26 },
  { id: "usda-203", name: "Noodles whole wheat cooked", category: "Grains/Snacks", carbRatio: 0.24 },
  { id: "usda-204", name: "Oat bran cooked", category: "Grains/Snacks", carbRatio: 0.10 },
  { id: "usda-205", name: "Oat bran raw", category: "Grains/Snacks", carbRatio: 0.58 },
  { id: "usda-206", name: "Oat bran bread", category: "Grains/Snacks", carbRatio: 0.38 },
  { id: "usda-207", name: "Oatmeal bread", category: "Grains/Snacks", carbRatio: 0.47 },
  { id: "usda-208", name: "Oatmeal cookies", category: "Grains/Snacks", carbRatio: 0.66 },
  { id: "usda-209", name: "Oatmeal cookies fat-free", category: "Grains/Snacks", carbRatio: 0.71 },
  { id: "usda-210", name: "Oatmeal raisin cookies", category: "Grains/Snacks", carbRatio: 0.68 },
  { id: "usda-211", name: "Oatmeal cooked", category: "Grains/Snacks", carbRatio: 0.11 },
  { id: "usda-212", name: "Oats dry", category: "Grains/Snacks", carbRatio: 0.63 },
  { id: "usda-213", name: "Olives", category: "Other", carbRatio: 0.04 },
  { id: "usda-214", name: "Onion rings", category: "Vegetables", carbRatio: 0.38 },
  { id: "usda-215", name: "Onions", category: "Vegetables", carbRatio: 0.08 },
  { id: "usda-216", name: "Oranges", category: "Fruits", carbRatio: 0.11 },
  { id: "usda-217", name: "Pancakes", category: "Grains/Snacks", carbRatio: 0.37 },
  { id: "usda-218", name: "Pancakes blueberry", category: "Grains/Snacks", carbRatio: 0.29 },
  { id: "usda-219", name: "Pancakes potato", category: "Grains/Snacks", carbRatio: 0.25 },
  { id: "usda-220", name: "Pancakes whole wheat", category: "Grains/Snacks", carbRatio: 0.27 },
  { id: "usda-221", name: "Papayas", category: "Fruits", carbRatio: 0.09 },
  { id: "usda-222", name: "Parsnips", category: "Vegetables", carbRatio: 0.15 },
  { id: "usda-223", name: "Peaches", category: "Fruits", carbRatio: 0.09 },
  { id: "usda-224", name: "Peaches canned in juice", category: "Fruits", carbRatio: 0.11 },
  { id: "usda-225", name: "Peaches canned in syrup", category: "Fruits", carbRatio: 0.19 },
  { id: "usda-226", name: "Peaches canned in water", category: "Fruits", carbRatio: 0.05 },
  { id: "usda-227", name: "Peanut brittle", category: "Other", carbRatio: 0.69 },
  { id: "usda-228", name: "Peanut butter", category: "Other", carbRatio: 0.16 },
  { id: "usda-229", name: "Peanut butter cookies", category: "Grains/Snacks", carbRatio: 0.58 },
  { id: "usda-230", name: "Peanut butter sandwich cookies", category: "Grains/Snacks", carbRatio: 0.64 },
  { id: "usda-231", name: "Peanut butter reduced-fat", category: "Other", carbRatio: 0.34 },
  { id: "usda-232", name: "Peanuts dry roasted", category: "Nuts/Seeds", carbRatio: 0.17 },
  { id: "usda-233", name: "Peanuts oil roasted", category: "Nuts/Seeds", carbRatio: 0.11 },
  { id: "usda-234", name: "Pears", category: "Fruits", carbRatio: 0.14 },
  { id: "usda-235", name: "Pears Asian", category: "Fruits", carbRatio: 0.09 },
  { id: "usda-236", name: "Pears canned in juice", category: "Fruits", carbRatio: 0.12 },
  { id: "usda-237", name: "Pears canned in syrup", category: "Fruits", carbRatio: 0.14 },
  { id: "usda-238", name: "Pears canned in water", category: "Fruits", carbRatio: 0.07 },
  { id: "usda-239", name: "Peas", category: "Vegetables", carbRatio: 0.12 },
  { id: "usda-240", name: "Peas canned", category: "Vegetables", carbRatio: 0.11 },
  { id: "usda-241", name: "Peas pods cooked", category: "Vegetables", carbRatio: 0.06 },
  { id: "usda-242", name: "Peas split cooked", category: "Vegetables", carbRatio: 0.17 },
  { id: "usda-243", name: "Peas & carrots", category: "Vegetables", carbRatio: 0.07 },
  { id: "usda-244", name: "Peas & onions", category: "Vegetables", carbRatio: 0.07 },
  { id: "usda-245", name: "Pecans", category: "Nuts/Seeds", carbRatio: 0.10 },
  { id: "usda-246", name: "Phyllo dough", category: "Grains/Snacks", carbRatio: 0.51 },
  { id: "usda-247", name: "Pickles dill", category: "Other", carbRatio: 0.02 },
  { id: "usda-248", name: "Pie crust", category: "Grains/Snacks", carbRatio: 0.57 },
  { id: "usda-249", name: "Pie filling apple", category: "Grains/Snacks", carbRatio: 0.25 },
  { id: "usda-250", name: "Pie filling cherry", category: "Grains/Snacks", carbRatio: 0.27 },
  { id: "usda-251", name: "Pies apple", category: "Grains/Snacks", carbRatio: 0.35 },
  { id: "usda-252", name: "Pies banana cream", category: "Grains/Snacks", carbRatio: 0.31 },
  { id: "usda-253", name: "Pies Boston cream", category: "Grains/Snacks", carbRatio: 0.42 },
  { id: "usda-254", name: "Pies cherry", category: "Grains/Snacks", carbRatio: 0.39 },
  { id: "usda-255", name: "Pies coconut cream", category: "Grains/Snacks", carbRatio: 0.28 },
  { id: "usda-256", name: "Pies lemon meringue", category: "Grains/Snacks", carbRatio: 0.43 },
  { id: "usda-257", name: "Pies peach", category: "Grains/Snacks", carbRatio: 0.32 },
  { id: "usda-258", name: "Pies pecan", category: "Grains/Snacks", carbRatio: 0.53 },
  { id: "usda-259", name: "Pies pumpkin", category: "Grains/Snacks", carbRatio: 0.26 },
  { id: "usda-260", name: "Pies vanilla cream", category: "Grains/Snacks", carbRatio: 0.32 },
  { id: "usda-261", name: "Pigeon peas", category: "Vegetables", carbRatio: 0.20 },
  { id: "usda-262", name: "Pineapple", category: "Fruits", carbRatio: 0.12 },
  { id: "usda-263", name: "Pineapple canned in juice", category: "Fruits", carbRatio: 0.15 },
  { id: "usda-264", name: "Pineapple canned in syrup", category: "Fruits", carbRatio: 0.13 },
  { id: "usda-265", name: "Pineapple canned in water", category: "Fruits", carbRatio: 0.08 },
  { id: "usda-266", name: "Pineapple cake", category: "Grains/Snacks", carbRatio: 0.50 },
  { id: "usda-267", name: "Pink beans", category: "Vegetables", carbRatio: 0.25 },
  { id: "usda-268", name: "Pinto beans canned", category: "Vegetables", carbRatio: 0.13 },
  { id: "usda-269", name: "Pinto beans cooked", category: "Vegetables", carbRatio: 0.22 },
  { id: "usda-270", name: "Pistachios", category: "Nuts/Seeds", carbRatio: 0.25 },
  { id: "usda-271", name: "Pita bread wheat", category: "Grains/Snacks", carbRatio: 0.51 },
  { id: "usda-272", name: "Pita bread white", category: "Grains/Snacks", carbRatio: 0.55 },
  { id: "usda-273", name: "Plantains", category: "Fruits", carbRatio: 0.30 },
  { id: "usda-274", name: "Plums", category: "Fruits", carbRatio: 0.11 },
  { id: "usda-275", name: "Pomegranates", category: "Fruits", carbRatio: 0.17 },
  { id: "usda-276", name: "Popcorn air-popped", category: "Grains/Snacks", carbRatio: 0.71 },
  { id: "usda-277", name: "Popcorn caramel", category: "Grains/Snacks", carbRatio: 0.77 },
  { id: "usda-278", name: "Popcorn cheese", category: "Grains/Snacks", carbRatio: 0.46 },
  { id: "usda-279", name: "Popcorn oil-popped", category: "Grains/Snacks", carbRatio: 0.52 },
  { id: "usda-280", name: "Pot pie beef", category: "Other", carbRatio: 0.17 },
  { id: "usda-281", name: "Pot pie chicken/turkey", category: "Other", carbRatio: 0.16 },
  { id: "usda-282", name: "Pot pie vegetable", category: "Other", carbRatio: 0.17 },
  { id: "usda-283", name: "Potato flour", category: "Grains/Snacks", carbRatio: 0.80 },
  { id: "usda-284", name: "Potatoes au gratin", category: "Vegetables", carbRatio: 0.12 },
  { id: "usda-285", name: "Potatoes baked with skin", category: "Vegetables", carbRatio: 0.19 },
  { id: "usda-286", name: "Potatoes boiled with skin", category: "Vegetables", carbRatio: 0.19 },
  { id: "usda-287", name: "Potatoes french fries", category: "Vegetables", carbRatio: 0.35 },
  { id: "usda-288", name: "Potatoes hash browns frozen", category: "Vegetables", carbRatio: 0.26 },
  { id: "usda-289", name: "Potatoes hash browns", category: "Vegetables", carbRatio: 0.31 },
  { id: "usda-290", name: "Potatoes mashed instant", category: "Vegetables", carbRatio: 0.13 },
  { id: "usda-291", name: "Potatoes mashed", category: "Vegetables", carbRatio: 0.16 },
  { id: "usda-292", name: "Potatoes OBrien", category: "Vegetables", carbRatio: 0.21 },
  { id: "usda-293", name: "Potatoes potato salad", category: "Vegetables", carbRatio: 0.11 },
  { id: "usda-294", name: "Potatoes scalloped", category: "Vegetables", carbRatio: 0.12 },
  { id: "usda-295", name: "Pound cake", category: "Grains/Snacks", carbRatio: 0.48 },
  { id: "usda-296", name: "Pound cake fat-free", category: "Grains/Snacks", carbRatio: 0.60 },
  { id: "usda-297", name: "Pretzels hard", category: "Grains/Snacks", carbRatio: 0.77 },
  { id: "usda-298", name: "Pretzels soft", category: "Grains/Snacks", carbRatio: 0.68 },
  { id: "usda-299", name: "Pretzels whole wheat", category: "Grains/Snacks", carbRatio: 0.73 },
  { id: "usda-300", name: "Prunes", category: "Fruits", carbRatio: 0.60 },
  { id: "usda-301", name: "Pumpernickel bread", category: "Grains/Snacks", carbRatio: 0.44 },
  { id: "usda-302", name: "Pumpkin canned pie mix", category: "Vegetables", carbRatio: 0.22 },
  { id: "usda-303", name: "Pumpkin canned", category: "Vegetables", carbRatio: 0.07 },
  { id: "usda-304", name: "Pumpkin seeds", category: "Nuts/Seeds", carbRatio: 0.45 },
  { id: "usda-305", name: "Quinoa cooked", category: "Grains/Snacks", carbRatio: 0.28 },
  { id: "usda-306", name: "Quinoa dry", category: "Grains/Snacks", carbRatio: 0.60 },
  { id: "usda-307", name: "Radishes", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-308", name: "Raisin bread", category: "Grains/Snacks", carbRatio: 0.50 },
  { id: "usda-309", name: "Raisins", category: "Fruits", carbRatio: 0.77 },
  { id: "usda-310", name: "Raspberries", category: "Fruits", carbRatio: 0.09 },
  { id: "usda-311", name: "Red hot chili peppers", category: "Vegetables", carbRatio: 0.08 },
  { id: "usda-312", name: "Red peppers", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-313", name: "Refried beans", category: "Other", carbRatio: 0.13 },
  { id: "usda-314", name: "Rhubarb", category: "Fruits", carbRatio: 0.04 },
  { id: "usda-315", name: "Rice brown cooked", category: "Grains/Snacks", carbRatio: 0.22 },
  { id: "usda-316", name: "Rice white cooked", category: "Grains/Snacks", carbRatio: 0.26 },
  { id: "usda-317", name: "Rice wild cooked", category: "Grains/Snacks", carbRatio: 0.20 },
  { id: "usda-318", name: "Rice bran bread", category: "Grains/Snacks", carbRatio: 0.41 },
  { id: "usda-319", name: "Rutabagas", category: "Vegetables", carbRatio: 0.07 },
  { id: "usda-320", name: "Rye bread", category: "Grains/Snacks", carbRatio: 0.45 },
  { id: "usda-321", name: "Rye flour", category: "Grains/Snacks", carbRatio: 0.70 },
  { id: "usda-322", name: "Semisweet chocolate", category: "Other", carbRatio: 0.57 },
  { id: "usda-323", name: "Semolina", category: "Grains/Snacks", carbRatio: 0.69 },
  { id: "usda-324", name: "Serrano peppers", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-325", name: "Sesame flour", category: "Grains/Snacks", carbRatio: 0.36 },
  { id: "usda-326", name: "Sesame seed butter", category: "Other", carbRatio: 0.21 },
  { id: "usda-327", name: "Sesame seeds", category: "Nuts/Seeds", carbRatio: 0.18 },
  { id: "usda-328", name: "Shallots", category: "Vegetables", carbRatio: 0.16 },
  { id: "usda-329", name: "Shortbread cookies", category: "Grains/Snacks", carbRatio: 0.63 },
  { id: "usda-330", name: "Shortbread cookies sugar", category: "Grains/Snacks", carbRatio: 0.63 },
  { id: "usda-331", name: "Shortbread cookies with pecans", category: "Grains/Snacks", carbRatio: 0.57 },
  { id: "usda-332", name: "Shortcake", category: "Grains/Snacks", carbRatio: 0.49 },
  { id: "usda-333", name: "Snap beans", category: "Vegetables", carbRatio: 0.05 },
  { id: "usda-334", name: "Soybeans cooked", category: "Other", carbRatio: 0.07 },
  { id: "usda-335", name: "Soybeans roasted", category: "Other", carbRatio: 0.25 },
  { id: "usda-336", name: "Spaghetti meat sauce", category: "Other", carbRatio: 0.19 },
  { id: "usda-337", name: "Spaghetti meatless sauce", category: "Other", carbRatio: 0.22 },
  { id: "usda-338", name: "Spinach", category: "Vegetables", carbRatio: 0.02 },
  { id: "usda-339", name: "Sponge cake", category: "Grains/Snacks", carbRatio: 0.59 },
  { id: "usda-340", name: "Squash summer", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-341", name: "Squash winter cooked", category: "Vegetables", carbRatio: 0.07 },
  { id: "usda-342", name: "Squash winter raw", category: "Vegetables", carbRatio: 0.08 },
  { id: "usda-343", name: "Strawberries", category: "Fruits", carbRatio: 0.07 },
  { id: "usda-344", name: "Succotash", category: "Other", carbRatio: 0.22 },
  { id: "usda-345", name: "Sunflower seed butter", category: "Other", carbRatio: 0.27 },
  { id: "usda-346", name: "Sunflower seeds dry roasted", category: "Nuts/Seeds", carbRatio: 0.20 },
  { id: "usda-347", name: "Sunflower seeds oil roasted", category: "Nuts/Seeds", carbRatio: 0.17 },
  { id: "usda-348", name: "Sweet potato", category: "Vegetables", carbRatio: 0.16 },
  { id: "usda-349", name: "Sweet potato candied", category: "Vegetables", carbRatio: 0.24 },
  { id: "usda-350", name: "Sweet rolls cheese", category: "Grains/Snacks", carbRatio: 0.43 },
  { id: "usda-351", name: "Sweet rolls cinnamon-raisin", category: "Grains/Snacks", carbRatio: 0.49 },
  { id: "usda-352", name: "Sweet rolls frosted", category: "Grains/Snacks", carbRatio: 0.56 },
  { id: "usda-353", name: "Swiss chard", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-354", name: "Tangerines", category: "Fruits", carbRatio: 0.12 },
  { id: "usda-355", name: "Tapioca pearl", category: "Other", carbRatio: 0.88 },
  { id: "usda-356", name: "Tomatillos", category: "Vegetables", carbRatio: 0.05 },
  { id: "usda-357", name: "Tomatoes", category: "Vegetables", carbRatio: 0.03 },
  { id: "usda-358", name: "Tomatoes juice", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-359", name: "Tomatoes paste", category: "Vegetables", carbRatio: 0.16 },
  { id: "usda-360", name: "Tomatoes stewed", category: "Vegetables", carbRatio: 0.12 },
  { id: "usda-361", name: "Tomatoes sun-dried", category: "Vegetables", carbRatio: 0.50 },
  { id: "usda-362", name: "Tomatoes whole canned", category: "Vegetables", carbRatio: 0.06 },
  { id: "usda-363", name: "Tortilla chips", category: "Grains/Snacks", carbRatio: 0.61 },
  { id: "usda-364", name: "Tortillas corn", category: "Grains/Snacks", carbRatio: 0.41 },
  { id: "usda-365", name: "Tortillas flour", category: "Grains/Snacks", carbRatio: 0.48 },
  { id: "usda-366", name: "Trail mix", category: "Other", carbRatio: 0.45 },
  { id: "usda-367", name: "Tuna casserole", category: "Other", carbRatio: 0.15 },
  { id: "usda-368", name: "Turnip greens", category: "Vegetables", carbRatio: 0.06 },
  { id: "usda-369", name: "Turnip greens cooked", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-370", name: "Turnips", category: "Vegetables", carbRatio: 0.06 },
  { id: "usda-371", name: "Turnips cooked", category: "Vegetables", carbRatio: 0.04 },
  { id: "usda-372", name: "Vienna bread", category: "Grains/Snacks", carbRatio: 0.55 },
  { id: "usda-373", name: "Waffles", category: "Grains/Snacks", carbRatio: 0.33 },
  { id: "usda-374", name: "Walnuts", category: "Nuts/Seeds", carbRatio: 0.07 },
  { id: "usda-375", name: "Watermelon", category: "Fruits", carbRatio: 0.07 },
  { id: "usda-376", name: "Wheat bread", category: "Grains/Snacks", carbRatio: 0.46 },
  { id: "usda-377", name: "Wheat flour", category: "Grains/Snacks", carbRatio: 0.60 },
  { id: "usda-378", name: "Wheat germ", category: "Grains/Snacks", carbRatio: 0.39 },
  { id: "usda-379", name: "White beans canned", category: "Vegetables", carbRatio: 0.18 },
  { id: "usda-380", name: "White beans cooked", category: "Vegetables", carbRatio: 0.22 },
  { id: "usda-381", name: "White bread", category: "Grains/Snacks", carbRatio: 0.49 },
  { id: "usda-382", name: "White cake", category: "Grains/Snacks", carbRatio: 0.56 },
  { id: "usda-383", name: "White flour", category: "Grains/Snacks", carbRatio: 0.74 },
  { id: "usda-384", name: "Yams", category: "Vegetables", carbRatio: 0.25 },
  { id: "usda-385", name: "Yellow cake frosted", category: "Grains/Snacks", carbRatio: 0.59 },
  { id: "usda-386", name: "Yellow cake unfrosted", category: "Grains/Snacks", carbRatio: 0.52 },
  { id: "usda-387", name: "Yellow peppers", category: "Vegetables", carbRatio: 0.06 }
];

export const FALLBACK_RESTAURANTS: Record<string, { food_id: string; item_name: string; serving_size: string; carbs: number }[]> = {
  "Starbucks": [
    { food_id: "fs-sb-1", item_name: "Caffè Latte, Tall", serving_size: "12 fl oz", carbs: 15 },
    { food_id: "fs-sb-2", item_name: "Caffè Latte, Grande", serving_size: "16 fl oz", carbs: 19 },
    { food_id: "fs-sb-3", item_name: "Caffè Latte, Venti", serving_size: "20 fl oz", carbs: 24 },
    { food_id: "fs-sb-4", item_name: "Caramel Macchiato, Tall", serving_size: "12 fl oz", carbs: 24 },
    { food_id: "fs-sb-5", item_name: "Caramel Macchiato, Grande", serving_size: "16 fl oz", carbs: 32 },
    { food_id: "fs-sb-6", item_name: "Caramel Macchiato, Venti", serving_size: "20 fl oz", carbs: 41 },
    { food_id: "fs-sb-7", item_name: "Chocolate Croissant", serving_size: "1 croissant (85g)", carbs: 38 },
    { food_id: "fs-sb-8", item_name: "Butter Croissant", serving_size: "1 croissant (68g)", carbs: 28 },
    { food_id: "fs-sb-9", item_name: "Pumpkin Bread", serving_size: "1 slice (123g)", carbs: 62 },
    { food_id: "fs-sb-10", item_name: "Banana Walnut Cake", serving_size: "1 slice (125g)", carbs: 55 },
    { food_id: "fs-sb-11", item_name: "Double Chocolate Brownie", serving_size: "1 brownie (74g)", carbs: 45 },
    { food_id: "fs-sb-12", item_name: "Spinach, Feta & Egg White Wrap", serving_size: "1 wrap (160g)", carbs: 34 },
    { food_id: "fs-sb-13", item_name: "Bacon, Gouda & Egg Sandwich", serving_size: "1 sandwich (119g)", carbs: 32 },
    { food_id: "fs-sb-14", item_name: "Double-Smoked Bacon & Cheddar", serving_size: "1 sandwich (145g)", carbs: 42 },
    { food_id: "fs-sb-15", item_name: "Iced Caramel Macchiato, Grande", serving_size: "16 fl oz", carbs: 34 },
    { food_id: "fs-sb-16", item_name: "Iced Brown Sugar Oatmeal Shaken Espresso", serving_size: "16 fl oz", carbs: 18 },
    { food_id: "fs-sb-17", item_name: "White Chocolate Mocha, Grande", serving_size: "16 fl oz", carbs: 53 },
    { food_id: "fs-sb-18", item_name: "Pink Drink, Grande", serving_size: "16 fl oz", carbs: 25 },
    { food_id: "fs-sb-19", item_name: "Strawberry Açaí Lemonade, Grande", serving_size: "16 fl oz", carbs: 32 },
    { food_id: "fs-sb-20", item_name: "Java Chip Frappuccino, Grande", serving_size: "16 fl oz", carbs: 65 }
  ],
  "McDonald's": [
    { food_id: "fs-mcd-1", item_name: "Big Mac", serving_size: "1 sandwich (219g)", carbs: 45 },
    { food_id: "fs-mcd-2", item_name: "Quarter Pounder with Cheese", serving_size: "1 sandwich (220g)", carbs: 42 },
    { food_id: "fs-mcd-29", item_name: "Double Quarter Pounder with Cheese", serving_size: "1 sandwich (290g)", carbs: 43 },
    { food_id: "fs-mcd-3", item_name: "French Fries, Small", serving_size: "1 serving (75g)", carbs: 29 },
    { food_id: "fs-mcd-4", item_name: "French Fries, Medium", serving_size: "1 serving (117g)", carbs: 44 },
    { food_id: "fs-mcd-5", item_name: "French Fries, Large", serving_size: "1 serving (150g)", carbs: 56 },
    { food_id: "fs-mcd-6", item_name: "Egg McMuffin", serving_size: "1 sandwich (132g)", carbs: 30 },
    { food_id: "fs-mcd-7", item_name: "Coca-Cola, Small", serving_size: "16 fl oz", carbs: 39 },
    { food_id: "fs-mcd-8", item_name: "Coca-Cola, Medium", serving_size: "21 fl oz", carbs: 51 },
    { food_id: "fs-mcd-9", item_name: "Coca-Cola, Large", serving_size: "30 fl oz", carbs: 76 },
    { food_id: "fs-mcd-10", item_name: "McDouble", serving_size: "1 sandwich (147g)", carbs: 34 },
    { food_id: "fs-mcd-11", item_name: "Double Cheeseburger", serving_size: "1 sandwich (151g)", carbs: 34 },
    { food_id: "fs-mcd-12", item_name: "Cheeseburger", serving_size: "1 sandwich (119g)", carbs: 32 },
    { food_id: "fs-mcd-13", item_name: "Hamburger", serving_size: "1 sandwich (100g)", carbs: 31 },
    { food_id: "fs-mcd-14", item_name: "Filet-O-Fish", serving_size: "1 sandwich (142g)", carbs: 38 },
    { food_id: "fs-mcd-15", item_name: "McChicken", serving_size: "1 sandwich (143g)", carbs: 40 },
    { food_id: "fs-mcd-16", item_name: "Spicy McChicken", serving_size: "1 sandwich (143g)", carbs: 46 },
    { food_id: "fs-mcd-28", item_name: "McCrispy Chicken Sandwich", serving_size: "1 sandwich (182g)", carbs: 45 },
    { food_id: "fs-mcd-30", item_name: "Spicy McCrispy Chicken Sandwich", serving_size: "1 sandwich (187g)", carbs: 46 },
    { food_id: "fs-mcd-31", item_name: "McCrispy Deluxe Sandwich", serving_size: "1 sandwich (230g)", carbs: 48 },
    { food_id: "fs-mcd-17", item_name: "Sausage McMuffin with Egg", serving_size: "1 sandwich (166g)", carbs: 29 },
    { food_id: "fs-mcd-18", item_name: "Sausage McMuffin", serving_size: "1 sandwich (111g)", carbs: 29 },
    { food_id: "fs-mcd-19", item_name: "Sausage Biscuit", serving_size: "1 biscuit (120g)", carbs: 34 },
    { food_id: "fs-mcd-32", item_name: "Sausage Biscuit with Egg", serving_size: "1 biscuit (165g)", carbs: 34 },
    { food_id: "fs-mcd-33", item_name: "Bacon, Egg & Cheese Biscuit", serving_size: "1 biscuit (145g)", carbs: 38 },
    { food_id: "fs-mcd-20", item_name: "Sausage, Egg & Cheese McGriddles", serving_size: "1 sandwich (201g)", carbs: 44 },
    { food_id: "fs-mcd-34", item_name: "Sausage McGriddles", serving_size: "1 sandwich (141g)", carbs: 42 },
    { food_id: "fs-mcd-35", item_name: "Bacon, Egg & Cheese McGriddles", serving_size: "1 sandwich (175g)", carbs: 45 },
    { food_id: "fs-mcd-21", item_name: "Hotcakes (with butter & syrup)", serving_size: "1 serving (148g)", carbs: 102 },
    { food_id: "fs-mcd-36", item_name: "Hotcakes and Sausage", serving_size: "1 serving (198g)", carbs: 102 },
    { food_id: "fs-mcd-22", item_name: "Hash Brown", serving_size: "1 hash brown (56g)", carbs: 15 },
    { food_id: "fs-mcd-23", item_name: "10 Piece Chicken McNuggets", serving_size: "10 nuggets (150g)", carbs: 25 },
    { food_id: "fs-mcd-24", item_name: "6 Piece Chicken McNuggets", serving_size: "6 nuggets (90g)", carbs: 15 },
    { food_id: "fs-mcd-25", item_name: "4 Piece Chicken McNuggets", serving_size: "4 nuggets (60g)", carbs: 10 },
    { food_id: "fs-mcd-26", item_name: "Baked Apple Pie", serving_size: "1 pie (77g)", carbs: 33 },
    { food_id: "fs-mcd-27", item_name: "Chocolate Shake, Small", serving_size: "12 fl oz", carbs: 62 },
    { food_id: "fs-mcd-37", item_name: "Chocolate Shake, Medium", serving_size: "16 fl oz", carbs: 85 },
    { food_id: "fs-mcd-38", item_name: "Vanilla Shake, Medium", serving_size: "16 fl oz", carbs: 81 },
    { food_id: "fs-mcd-39", item_name: "Strawberry Shake, Medium", serving_size: "16 fl oz", carbs: 83 },
    { food_id: "fs-mcd-40", item_name: "McFlurry with OREO Cookies, Regular", serving_size: "1 serving (340g)", carbs: 80 },
    { food_id: "fs-mcd-41", item_name: "McFlurry with M&M'S Candies, Regular", serving_size: "1 serving (340g)", carbs: 96 },
    { food_id: "fs-mcd-42", item_name: "Caramel Sundae", serving_size: "1 cup (155g)", carbs: 52 },
    { food_id: "fs-mcd-43", item_name: "Hot Fudge Sundae", serving_size: "1 cup (155g)", carbs: 48 },
    { food_id: "fs-mcd-44", item_name: "Iced Caramel Macchiato, Medium", serving_size: "16 fl oz", carbs: 33 }
  ],
  "Subway": [
    { food_id: "fs-sub-1", item_name: "6\" Spicy Italian Sub", serving_size: "1 sub (218g)", carbs: 46 },
    { food_id: "fs-sub-2", item_name: "12\" Spicy Italian Sub", serving_size: "1 sub (436g)", carbs: 92 },
    { food_id: "fs-sub-3", item_name: "6\" Italian B.M.T. Sub", serving_size: "1 sub (224g)", carbs: 47 },
    { food_id: "fs-sub-4", item_name: "12\" Italian B.M.T. Sub", serving_size: "1 sub (448g)", carbs: 94 },
    { food_id: "fs-sub-5", item_name: "6\" Tuna Sub", serving_size: "1 sub (220g)", carbs: 44 },
    { food_id: "fs-sub-6", item_name: "12\" Tuna Sub", serving_size: "1 sub (440g)", carbs: 88 },
    { food_id: "fs-sub-7", item_name: "6\" Turkey Breast Sub", serving_size: "1 sub (219g)", carbs: 46 },
    { food_id: "fs-sub-8", item_name: "12\" Turkey Breast Sub", serving_size: "1 sub (438g)", carbs: 92 },
    { food_id: "fs-sub-9", item_name: "6\" Meatball Marinara Sub", serving_size: "1 sub (290g)", carbs: 59 },
    { food_id: "fs-sub-10", item_name: "12\" Meatball Marinara Sub", serving_size: "1 sub (580g)", carbs: 118 },
    { food_id: "fs-sub-13", item_name: "6\" Cold Cut Combo Sub", serving_size: "1 sub (225g)", carbs: 46 },
    { food_id: "fs-sub-14", item_name: "12\" Cold Cut Combo Sub", serving_size: "1 sub (450g)", carbs: 92 },
    { food_id: "fs-sub-15", item_name: "6\" Sweet Onion Teriyaki Sub", serving_size: "1 sub (230g)", carbs: 55 },
    { food_id: "fs-sub-16", item_name: "12\" Sweet Onion Teriyaki Sub", serving_size: "1 sub (460g)", carbs: 110 },
    { food_id: "fs-sub-17", item_name: "6\" Steak & Cheese Sub", serving_size: "1 sub (240g)", carbs: 48 },
    { food_id: "fs-sub-18", item_name: "12\" Steak & Cheese Sub", serving_size: "1 sub (480g)", carbs: 96 },
    { food_id: "fs-sub-11", item_name: "Chocolate Chip Cookie", serving_size: "1 cookie (45g)", carbs: 30 },
    { food_id: "fs-sub-12", item_name: "Oatmeal Raisin Cookie", serving_size: "1 cookie (45g)", carbs: 30 },
    { food_id: "fs-sub-19", item_name: "Raspberry Cheesecake Cookie", serving_size: "1 cookie (45g)", carbs: 29 }
  ],
  "Taco Bell": [
    { food_id: "fs-tb-1", item_name: "Crunchy Taco", serving_size: "1 taco (78g)", carbs: 13 },
    { food_id: "fs-tb-12", item_name: "Crunchy Taco Supreme", serving_size: "1 taco (109g)", carbs: 15 },
    { food_id: "fs-tb-2", item_name: "Soft Taco", serving_size: "1 taco (102g)", carbs: 17 },
    { food_id: "fs-tb-13", item_name: "Soft Taco Supreme", serving_size: "1 taco (113g)", carbs: 18 },
    { food_id: "fs-tb-14", item_name: "Chalupa Supreme (Beef)", serving_size: "1 chalupa (141g)", carbs: 31 },
    { food_id: "fs-tb-3", item_name: "Beef Quesarito", serving_size: "1 burrito (264g)", carbs: 65 },
    { food_id: "fs-tb-4", item_name: "Cheese Quesadilla", serving_size: "1 quesadilla (145g)", carbs: 36 },
    { food_id: "fs-tb-6", item_name: "Chicken Quesadilla", serving_size: "1 quesadilla (184g)", carbs: 38 },
    { food_id: "fs-tb-5", item_name: "Bean Burrito", serving_size: "1 burrito (198g)", carbs: 54 },
    { food_id: "fs-tb-7", item_name: "Beefy 5-Layer Burrito", serving_size: "1 burrito (229g)", carbs: 62 },
    { food_id: "fs-tb-15", item_name: "Burrito Supreme (Beef)", serving_size: "1 burrito (238g)", carbs: 52 },
    { food_id: "fs-tb-16", item_name: "Cheesy Bean & Rice Burrito", serving_size: "1 burrito (180g)", carbs: 54 },
    { food_id: "fs-tb-8", item_name: "Crunchwrap Supreme", serving_size: "1 crunchwrap (249g)", carbs: 71 },
    { food_id: "fs-tb-17", item_name: "Cheesy Gordita Crunch", serving_size: "1 gordita (173g)", carbs: 41 },
    { food_id: "fs-tb-9", item_name: "Cheesy Roll Up", serving_size: "1 roll (57g)", carbs: 15 },
    { food_id: "fs-tb-18", item_name: "Nachos BellGrande", serving_size: "1 box (371g)", carbs: 84 },
    { food_id: "fs-tb-19", item_name: "Chips and Nacho Cheese Sauce", serving_size: "1 serving (90g)", carbs: 24 },
    { food_id: "fs-tb-10", item_name: "Cinnamon Twists", serving_size: "1 bag (35g)", carbs: 27 },
    { food_id: "fs-tb-20", item_name: "Cinnabon Delights (4 Pack)", serving_size: "4 pack (68g)", carbs: 35 },
    { food_id: "fs-tb-11", item_name: "Nacho Cheese Doritos Locos Tacos", serving_size: "1 taco (78g)", carbs: 15 }
  ],
  "Wendy's": [
    { food_id: "fs-wen-1", item_name: "Dave's Single Hamburger", serving_size: "1 sandwich (230g)", carbs: 40 },
    { food_id: "fs-wen-2", item_name: "Dave's Double Hamburger", serving_size: "1 sandwich (315g)", carbs: 40 },
    { food_id: "fs-wen-13", item_name: "Dave's Triple Hamburger", serving_size: "1 sandwich (420g)", carbs: 42 },
    { food_id: "fs-wen-3", item_name: "Baconator", serving_size: "1 sandwich (277g)", carbs: 40 },
    { food_id: "fs-wen-4", item_name: "Son of Baconator", serving_size: "1 sandwich (173g)", carbs: 37 },
    { food_id: "fs-wen-14", item_name: "Jr. Bacon Cheeseburger", serving_size: "1 sandwich (149g)", carbs: 26 },
    { food_id: "fs-wen-15", item_name: "Jr. Cheeseburger Deluxe", serving_size: "1 sandwich (129g)", carbs: 26 },
    { food_id: "fs-wen-5", item_name: "Spicy Chicken Sandwich", serving_size: "1 sandwich (210g)", carbs: 51 },
    { food_id: "fs-wen-16", item_name: "Classic Chicken Sandwich", serving_size: "1 sandwich (200g)", carbs: 49 },
    { food_id: "fs-wen-17", item_name: "Asiago Ranch Chicken Club", serving_size: "1 sandwich (240g)", carbs: 50 },
    { food_id: "fs-wen-6", item_name: "4 Piece Chicken Nuggets", serving_size: "1 serving (42g)", carbs: 10 },
    { food_id: "fs-wen-7", item_name: "10 Piece Chicken Nuggets", serving_size: "1 serving (105g)", carbs: 25 },
    { food_id: "fs-wen-18", item_name: "4 Piece Spicy Chicken Nuggets", serving_size: "1 serving (42g)", carbs: 10 },
    { food_id: "fs-wen-19", item_name: "10 Piece Spicy Chicken Nuggets", serving_size: "1 serving (105g)", carbs: 25 },
    { food_id: "fs-wen-8", item_name: "French Fries, Medium", serving_size: "1 serving (125g)", carbs: 47 },
    { food_id: "fs-wen-20", item_name: "French Fries, Small", serving_size: "1 serving (90g)", carbs: 34 },
    { food_id: "fs-wen-21", item_name: "French Fries, Large", serving_size: "1 serving (165g)", carbs: 62 },
    { food_id: "fs-wen-9", item_name: "Chocolate Frosty, Small", serving_size: "1 cup (227g)", carbs: 50 },
    { food_id: "fs-wen-10", item_name: "Chocolate Frosty, Medium", serving_size: "1 cup (340g)", carbs: 79 },
    { food_id: "fs-wen-22", item_name: "Vanilla Frosty, Medium", serving_size: "1 cup (340g)", carbs: 79 },
    { food_id: "fs-wen-11", item_name: "Baked Potato with Sour Cream & Chive", serving_size: "1 potato (315g)", carbs: 63 },
    { food_id: "fs-wen-23", item_name: "Baked Potato with Cheese & Bacon", serving_size: "1 potato (375g)", carbs: 65 },
    { food_id: "fs-wen-12", item_name: "Chili, Small", serving_size: "1 bowl (227g)", carbs: 16 },
    { food_id: "fs-wen-24", item_name: "Chili, Large", serving_size: "1 bowl (340g)", carbs: 23 }
  ],
  "Burger King": [
    { food_id: "fs-bk-1", item_name: "Whopper Hamburger", serving_size: "1 sandwich (290g)", carbs: 49 },
    { food_id: "fs-bk-2", item_name: "Whopper with Cheese", serving_size: "1 sandwich (315g)", carbs: 50 },
    { food_id: "fs-bk-3", item_name: "Double Whopper", serving_size: "1 sandwich (374g)", carbs: 49 },
    { food_id: "fs-bk-10", item_name: "Triple Whopper", serving_size: "1 sandwich (450g)", carbs: 50 },
    { food_id: "fs-bk-11", item_name: "Whopper Jr.", serving_size: "1 sandwich (148g)", carbs: 30 },
    { food_id: "fs-bk-12", item_name: "Bacon Double King", serving_size: "1 sandwich (340g)", carbs: 40 },
    { food_id: "fs-bk-4", item_name: "Bacon Double Cheeseburger", serving_size: "1 sandwich (150g)", carbs: 31 },
    { food_id: "fs-bk-13", item_name: "French Toast Sticks (3 Pc)", serving_size: "1 serving (56g)", carbs: 29 },
    { food_id: "fs-bk-14", item_name: "French Toast Sticks (5 Pc)", serving_size: "1 serving (93g)", carbs: 48 },
    { food_id: "fs-bk-5", item_name: "Chicken Fries (9 Pc)", serving_size: "1 serving (107g)", carbs: 20 },
    { food_id: "fs-bk-6", item_name: "Original Chicken Sandwich", serving_size: "1 sandwich (204g)", carbs: 48 },
    { food_id: "fs-bk-15", item_name: "Royal Crispy Chicken Sandwich", serving_size: "1 sandwich (225g)", carbs: 54 },
    { food_id: "fs-bk-16", item_name: "Spicy Royal Crispy Chicken Sandwich", serving_size: "1 sandwich (225g)", carbs: 58 },
    { food_id: "fs-bk-7", item_name: "French Fries, Medium", serving_size: "1 serving (117g)", carbs: 44 },
    { food_id: "fs-bk-17", item_name: "French Fries, Small", serving_size: "1 serving (90g)", carbs: 34 },
    { food_id: "fs-bk-18", item_name: "French Fries, Large", serving_size: "1 serving (150g)", carbs: 56 },
    { food_id: "fs-bk-8", item_name: "Onion Rings, Medium", serving_size: "1 serving (110g)", carbs: 46 },
    { food_id: "fs-bk-9", item_name: "Hershey's Sundae Pie", serving_size: "1 slice (78g)", carbs: 32 }
  ],
  "Chipotle": [
    { food_id: "fs-chip-1", item_name: "Chicken Burrito (with Rice, Beans, Salsa)", serving_size: "1 burrito (550g)", carbs: 125 },
    { food_id: "fs-chip-2", item_name: "Steak Burrito (with Rice, Beans, Salsa)", serving_size: "1 burrito (550g)", carbs: 125 },
    { food_id: "fs-chip-3", item_name: "Chicken Burrito Bowl (with Rice, Beans, Salsa)", serving_size: "1 bowl (450g)", carbs: 50 },
    { food_id: "fs-chip-4", item_name: "Steak Burrito Bowl (with Rice, Beans, Salsa)", serving_size: "1 bowl (450g)", carbs: 50 },
    { food_id: "fs-chip-10", item_name: "Barbacoa Burrito Bowl (with Rice, Beans, Salsa)", serving_size: "1 bowl (450g)", carbs: 50 },
    { food_id: "fs-chip-11", item_name: "Carnitas Burrito Bowl (with Rice, Beans, Salsa)", serving_size: "1 bowl (450g)", carbs: 50 },
    { food_id: "fs-chip-12", item_name: "Sofritas Burrito Bowl (with Rice, Beans, Salsa)", serving_size: "1 bowl (450g)", carbs: 59 },
    { food_id: "fs-chip-5", item_name: "Flour Tortilla (for Burrito/Tacos)", serving_size: "1 tortilla (100g)", carbs: 50 },
    { food_id: "fs-chip-6", item_name: "White Rice (with Cilantro-Lime)", serving_size: "1 scoop (113g)", carbs: 40 },
    { food_id: "fs-chip-13", item_name: "Brown Rice", serving_size: "1 scoop (113g)", carbs: 36 },
    { food_id: "fs-chip-7", item_name: "Black Beans (cooked)", serving_size: "1 scoop (113g)", carbs: 22 },
    { food_id: "fs-chip-14", item_name: "Pinto Beans", serving_size: "1 scoop (113g)", carbs: 21 },
    { food_id: "fs-chip-8", item_name: "Guacamole", serving_size: "1 scoop (113g)", carbs: 8 },
    { food_id: "fs-chip-9", item_name: "Chips & Guacamole", serving_size: "1 serving (170g)", carbs: 75 },
    { food_id: "fs-chip-15", item_name: "Chips & Fresh Tomato Salsa", serving_size: "1 serving (140g)", carbs: 77 }
  ]
};

// --- USDA FoodData Central Integration ---

export async function searchUSDAFoods(query: string): Promise<FoodItem[]> {
  const token = process.env.USDA_API_KEY;
  const qClean = query.trim();
  if (!qClean) return [];

  if (!token) {
    // Perform robust local fallback filter
    const lower = qClean.toLowerCase();
    return FALLBACK_USDA_FOODS.filter(f => f.name.toLowerCase().includes(lower));
  }

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${token}&query=${encodeURIComponent(qClean)}&pageSize=30`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`USDA API failed: ${resp.status}`);
    }
    const data: any = await resp.json();
    const foodsList = data.foods || [];

    return foodsList.map((item: any) => {
      // Find Carbs value
      let carbVal = 0;
      if (item.foodNutrients) {
        // usually named "Carbohydrate, by difference"
        const carbNutrient = item.foodNutrients.find(
          (n: any) =>
            n.nutrientId === 1005 || // Carbs standard ID
            n.nutrientName?.toLowerCase().includes("carbohydrate")
        );
        if (carbNutrient) {
          carbVal = Number(carbNutrient.value) || 0; // value is normally per 100g in FDC
        }
      }

      const category = (item.foodCategory || "Other") as any;

      return {
        id: `usda-${item.fdcId}`,
        name: item.description,
        category: category.toLowerCase().includes("fruit") ? "Fruits" :
                 category.toLowerCase().includes("veg") ? "Vegetables" :
                 category.toLowerCase().includes("nut") ? "Nuts/Seeds" :
                 category.toLowerCase().includes("grain") || category.toLowerCase().includes("snack") ? "Grains/Snacks" : "Other",
        carbRatio: carbVal / 100, // carbs per 1g
        servingSize: item.servingSize ? `${item.servingSize}${item.servingSizeUnit || 'g'}` : undefined
      };
    });
  } catch (error) {
    console.error("Error fetching from USDA API. Using fallback search.", error);
    const lower = qClean.toLowerCase();
    return FALLBACK_USDA_FOODS.filter(f => f.name.toLowerCase().includes(lower));
  }
}

// --- FatSecret OAuth 2.0 Integration ---

let fatSecretAccessToken = "";
let fatSecretTokenExpiry = 0;

async function getFatSecretToken(): Promise<string | null> {
  const clientKey = process.env.FATSECRET_CONSUMER_KEY;
  const clientSecret = process.env.FATSECRET_CONSUMER_SECRET;

  if (!clientKey || !clientSecret) {
    return null;
  }

  // Token cache check
  if (fatSecretAccessToken && Date.now() < fatSecretTokenExpiry) {
    return fatSecretAccessToken;
  }

  try {
    const credentials = Buffer.from(`${clientKey}:${clientSecret}`).toString('base64');
    const resp = await fetch("https://oauth.fatsecret.com/connect/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials&scope=food"
    });

    if (!resp.ok) {
      throw new Error(`Token request failed: ${resp.status}`);
    }

    const data: any = await resp.json();
    fatSecretAccessToken = data.access_token;
    fatSecretTokenExpiry = Date.now() + (data.expires_in * 1000) - 10000; // cache token, minus 10s grace
    return fatSecretAccessToken;
  } catch (err) {
    console.error("FatSecret OAuth failed:", err);
    return null;
  }
}

export async function searchFatSecretBrands(query: string): Promise<string[]> {
  const qClean = query.trim().toLowerCase();
  if (qClean.length < 2) return [];

  const token = await getFatSecretToken();
  if (!token) {
    // Local list:
    const brands = Object.keys(FALLBACK_RESTAURANTS);
    return brands.filter(b => {
      const bNorm = b.toLowerCase().replace(/[^a-z0-9]/g, '');
      const qNorm = qClean.replace(/[^a-z0-9]/g, '');
      return bNorm.includes(qNorm) || qNorm.includes(bNorm);
    });
  }

  try {
    // FatSecret method food.brands.search
    const url = `https://platform.fatsecret.com/rest/server.api?method=food.brands.search.v2&search_expression=${encodeURIComponent(qClean)}&format=json`;
    const resp = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!resp.ok) {
      throw new Error(`FatSecret API search error: ${resp.status}`);
    }

    const data: any = await resp.json();
    const brandContainer = data.brands || {};
    const brandList = brandContainer.brand || [];

    const result = Array.isArray(brandList) 
      ? brandList.map((b: any) => b.brand_name)
      : [brandList.brand_name].filter(Boolean);

    return result as string[];
  } catch (err) {
    console.error("FatSecret brand search failed, using fallback:", err);
    const brands = Object.keys(FALLBACK_RESTAURANTS);
    return brands.filter(b => {
      const bNorm = b.toLowerCase().replace(/[^a-z0-9]/g, '');
      const qNorm = qClean.replace(/[^a-z0-9]/g, '');
      return bNorm.includes(qNorm) || qNorm.includes(bNorm);
    });
  }
}

export async function getFatSecretMenu(brandName: string): Promise<{ food_id: string; item_name: string; serving_size: string; carbs: number }[]> {
  const cleanBrand = brandName.trim();
  const token = await getFatSecretToken();

  const getFallbackMenu = () => {
    const cleanBrandNorm = cleanBrand.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchKey = Object.keys(FALLBACK_RESTAURANTS).find(k => {
      const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      return kNorm === cleanBrandNorm || kNorm.includes(cleanBrandNorm) || cleanBrandNorm.includes(kNorm);
    });
    return matchKey ? FALLBACK_RESTAURANTS[matchKey] : [];
  };

  if (!token) {
    return getFallbackMenu();
  }

  try {
    // FatSecret method foods.search with brand lookup prefix
    const url = `https://platform.fatsecret.com/rest/server.api?method=foods.search.v2&search_expression=${encodeURIComponent(cleanBrand)}&format=json`;
    const resp = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!resp.ok) {
      throw new Error(`FatSecret menu failed: ${resp.status}`);
    }

    const data: any = await resp.json();
    const foodContainer = data.foods || {};
    const foodList = foodContainer.food || [];

    const items = Array.isArray(foodList) ? foodList : [foodList].filter(Boolean);

    return items
      .filter((f: any) => f.brand_name && f.brand_name.toLowerCase() === cleanBrand.toLowerCase())
      .map((f: any) => {
        // parse servings or standard carbs
        let carbs = 0;
        let servingStr = "1 serving";

        if (f.food_description) {
          // Parse: "Per 100g - Calories: 120kcal | Fat: 3.40g | Carbs: 11.20g | Protein: 3.60g"
          // Or: "Per 1 serving (150g) - Calories..."
          const carbMatch = f.food_description.match(/Carbs:\s*([\d\.]+)g/);
          if (carbMatch) {
            carbs = parseFloat(carbMatch[1]) || 0;
          }
          const servingMatch = f.food_description.match(/Per\s*([^-\|]+)/);
          if (servingMatch) {
            servingStr = servingMatch[1].trim();
          }
        }
        return {
          food_id: f.food_id,
          item_name: f.food_name,
          serving_size: servingStr,
          carbs
        };
      });
  } catch (err) {
    console.error("FatSecret api menu failed, using fallback:", err);
    return getFallbackMenu();
  }
}

export async function searchFatSecretFoods(query: string): Promise<FoodItem[]> {
  const qClean = query.trim().toLowerCase();
  if (qClean.length < 2) return [];

  const token = await getFatSecretToken();
  if (!token) {
    const matched: FoodItem[] = [];
    Object.entries(FALLBACK_RESTAURANTS).forEach(([brand, items]) => {
      items.forEach(it => {
        if (it.item_name.toLowerCase().includes(qClean) || brand.toLowerCase().includes(qClean)) {
          matched.push({
            id: 'fs-' + it.food_id,
            name: `${brand} - ${it.item_name}`,
            category: 'Other',
            carbRatio: parseFloat((it.carbs / 100).toFixed(4)) || 0.15,
            servingSize: it.serving_size,
            servingCarbs: it.carbs,
            isBranded: true
          });
        }
      });
    });
    return matched.slice(0, 15);
  }

  try {
    const url = `https://platform.fatsecret.com/rest/server.api?method=foods.search.v2&search_expression=${encodeURIComponent(query)}&format=json`;
    const resp = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!resp.ok) return [];
    const data: any = await resp.json();
    const foodContainer = data.foods || {};
    const foodList = foodContainer.food || [];
    const items = Array.isArray(foodList) ? foodList : [foodList].filter(Boolean);
    return items.map((f: any) => {
      let carbs = 15;
      let servingStr = "100g";
      if (f.food_description) {
        const carbMatch = f.food_description.match(/Carbs:\s*([\d\.]+)g/);
        if (carbMatch) carbs = parseFloat(carbMatch[1]) || 0;
        const servingMatch = f.food_description.match(/Per\s*([^-\|]+)/);
        if (servingMatch) servingStr = servingMatch[1].trim();
      }
      return {
        id: 'fs-' + f.food_id,
        name: f.brand_name ? `${f.brand_name} - ${f.food_name}` : f.food_name,
        category: 'Other' as any,
        carbRatio: parseFloat((carbs / 100).toFixed(4)) || 0.15,
        servingSize: servingStr,
        servingCarbs: carbs,
        isBranded: true
      } as any;
    }).slice(0, 15);
  } catch (err) {
    console.error("FatSecret food search error:", err);
    return [];
  }
}
