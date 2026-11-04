/**
 * Rule-Based Automatic Categorization Utility
 * Simple keyword matching algorithm.
 * ALWAYS allows manual user override!
 */

const KEYWORD_RULES = [
  // Expense Rules
  { category: 'Food', keywords: ['food', 'lunch', 'dinner', 'grocery', 'restaurant', 'cafe', 'coffee', 'mcdonald', 'pizza', 'burger', 'supermarket', 'kfc', 'subway', 'dining', 'eat'] },
  { category: 'Transport', keywords: ['uber', 'careem', 'fuel', 'petrol', 'bus', 'taxi', 'transport', 'train', 'flight', 'fare', 'vehicle', 'gasoline'] },
  { category: 'Shopping', keywords: ['clothes', 'clothing', 'amazon', 'shopping', 'shoes', 'electronics', 'mall', 'outfit', 'keyboard', 'laptop', 'store'] },
  { category: 'Bills', keywords: ['electricity', 'internet', 'mobile', 'phone', 'gas', 'bill', 'wifi', 'broadband', 'utility', 'utilities'] },
  { category: 'Education', keywords: ['book', 'course', 'university', 'tuition', 'education', 'udemy', 'school', 'fee', 'exam', 'cert'] },
  { category: 'Health', keywords: ['doctor', 'medicine', 'pharmacy', 'hospital', 'health', 'clinic', 'lab', 'medical', 'dental'] },
  { category: 'Entertainment', keywords: ['movie', 'cinema', 'netflix', 'gaming', 'spotify', 'concert', 'show', 'ticket', 'steam', 'playstation'] },
  { category: 'Rent', keywords: ['rent', 'apartment', 'house', 'hostel', 'flat'] },
  
  // Income Rules
  { category: 'Salary', keywords: ['salary', 'paycheck', 'payroll', 'wage', 'monthly pay'] },
  { category: 'Freelance', keywords: ['freelance', 'client payment', 'project payment', 'gig', 'upwork', 'fiverr'] },
  { category: 'Business', keywords: ['business', 'revenue', 'sales', 'profit', 'store sales'] },
  { category: 'Investment', keywords: ['dividend', 'stock', 'investment', 'crypto', 'return', 'interest'] }
];

function suggestCategory(description) {
  if (!description || typeof description !== 'string') {
    return 'Other';
  }

  const descLower = description.toLowerCase().trim();

  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (descLower.includes(kw)) {
        return rule.category;
      }
    }
  }

  return 'Other';
}

module.exports = {
  suggestCategory,
  KEYWORD_RULES
};
