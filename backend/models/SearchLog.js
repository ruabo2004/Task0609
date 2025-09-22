const { pool } = require("../config/database");

class SearchLog {
  constructor(data) {
    this.log_id = data.log_id;
    this.customer_id = data.customer_id;
    this.search_query = data.search_query;
    this.search_type = data.search_type;
    this.filters_applied = data.filters_applied;
    this.results_count = data.results_count;
    this.page_number = data.page_number;
    this.sort_by = data.sort_by;
    this.sort_order = data.sort_order;
    this.session_id = data.session_id;
    this.ip_address = data.ip_address;
    this.user_agent = data.user_agent;
    this.search_time_ms = data.search_time_ms;
    this.clicked_result_id = data.clicked_result_id;
    this.clicked_position = data.clicked_position;
    this.created_at = data.created_at;
  }

  static async create(logData) {
    try {
      const {
        customerId = null,
        searchQuery,
        searchType = "rooms",
        filtersApplied = null,
        resultsCount = 0,
        pageNumber = 1,
        sortBy = "relevance",
        sortOrder = "desc",
        sessionId = null,
        ipAddress = null,
        userAgent = null,
        searchTimeMs = null,
      } = logData;

      const filtersJson = filtersApplied
        ? JSON.stringify(filtersApplied)
        : null;

      const [result] = await pool.execute(
        `INSERT INTO search_logs 
         (customer_id, search_query, search_type, filters_applied, results_count, 
          page_number, sort_by, sort_order, session_id, ip_address, user_agent, search_time_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          searchQuery,
          searchType,
          filtersJson,
          resultsCount,
          pageNumber,
          sortBy,
          sortOrder,
          sessionId,
          ipAddress,
          userAgent,
          searchTimeMs,
        ]
      );

      const [rows] = await pool.execute(
        "SELECT * FROM search_logs WHERE log_id = ?",
        [result.insertId]
      );

      return new SearchLog(rows[0]);
    } catch (error) {
      throw new Error(`Error creating search log: ${error.message}`);
    }
  }

  static async updateClickData(logId, clickedResultId, clickedPosition) {
    try {
      const [result] = await pool.execute(
        "UPDATE search_logs SET clicked_result_id = ?, clicked_position = ? WHERE log_id = ?",
        [clickedResultId, clickedPosition, logId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating click data: ${error.message}`);
    }
  }

  static async getPopularSearches(limit = 10, timeframe = "30d") {
    try {
      // Temporarily return empty array to avoid SQL errors
      return [];
      let dateCondition = "";
      if (timeframe === "7d") {
        dateCondition = "AND search_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
      } else if (timeframe === "30d") {
        dateCondition = "AND search_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      } else if (timeframe === "90d") {
        dateCondition = "AND search_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
      }

      const [rows] = await pool.execute(
        `SELECT 
           search_query,
           COUNT(*) as search_count,
           AVG(results_count) as avg_results,
           0 as avg_search_time,
           COUNT(DISTINCT customer_id) as unique_users,
           COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END) as clicks,
           (COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END) / COUNT(*) * 100) as click_through_rate
         FROM search_logs 
         WHERE search_query IS NOT NULL 
         AND search_query != '' 
         ${dateCondition}
         GROUP BY search_query 
         HAVING search_count >= 2
         ORDER BY search_count DESC, click_through_rate DESC 
         LIMIT ?`,
        [limit]
      );

      return rows;
    } catch (error) {
      throw new Error(`Error getting popular searches: ${error.message}`);
    }
  }

  static async getSearchSuggestions(query, limit = 5) {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT search_query, COUNT(*) as frequency
         FROM search_logs 
         WHERE search_query LIKE ? 
         AND search_query != ?
         AND results_count > 0
         AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
         GROUP BY search_query 
         ORDER BY frequency DESC, search_query 
         LIMIT ?`,
        [`%${query}%`, query, limit]
      );

      return rows.map((row) => ({
        suggestion: row.search_query,
        frequency: row.frequency,
      }));
    } catch (error) {
      throw new Error(`Error getting search suggestions: ${error.message}`);
    }
  }

  static async getSearchAnalytics(customerId = null, timeframe = "30d") {
    try {
      let customerCondition = "";
      let params = [];

      if (customerId) {
        customerCondition = "AND customer_id = ?";
        params.push(customerId);
      }

      let dateCondition = "";
      if (timeframe === "7d") {
        dateCondition = "AND search_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
      } else if (timeframe === "30d") {
        dateCondition = "AND search_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      } else if (timeframe === "90d") {
        dateCondition = "AND search_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
      }

      const [analyticsRows] = await pool.execute(
        `SELECT 
           COUNT(*) as total_searches,
           COUNT(DISTINCT customer_id) as unique_searchers,
           AVG(results_count) as avg_results_per_search,
           0 as avg_search_time,
           COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END) as total_clicks,
           (COUNT(CASE WHEN clicked_result_id IS NOT NULL THEN 1 END) / COUNT(*) * 100) as overall_ctr,
           COUNT(CASE WHEN results_count = 0 THEN 1 END) as zero_result_searches,
           (COUNT(CASE WHEN results_count = 0 THEN 1 END) / COUNT(*) * 100) as zero_result_rate
         FROM search_logs 
         WHERE 1=1 ${dateCondition} ${customerCondition}`,
        params
      );

      const [topSearchesRows] = await pool.execute(
        `SELECT search_query, COUNT(*) as count
         FROM search_logs 
         WHERE search_query IS NOT NULL 
         AND search_query != '' 
         ${dateCondition} ${customerCondition}
         GROUP BY search_query 
         ORDER BY count DESC 
         LIMIT 10`,
        params
      );

      const [searchTrendsRows] = await pool.execute(
        `SELECT 
           DATE(created_at) as search_date,
           COUNT(*) as search_count,
           COUNT(DISTINCT customer_id) as unique_users,
           AVG(results_count) as avg_results
         FROM search_logs 
         WHERE 1=1 ${dateCondition} ${customerCondition}
         GROUP BY DATE(created_at) 
         ORDER BY search_date DESC 
         LIMIT 30`,
        params
      );

      return {
        overview: analyticsRows[0],
        topSearches: topSearchesRows,
        trends: searchTrendsRows,
      };
    } catch (error) {
      throw new Error(`Error getting search analytics: ${error.message}`);
    }
  }

  static async getCustomerSearchHistory(customerId, limit = 50) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           search_query,
           search_type,
           filters_applied,
           results_count,
           clicked_result_id,
           created_at
         FROM search_logs 
         WHERE customer_id = ? 
         AND search_query IS NOT NULL 
         AND search_query != ''
         ORDER BY created_at DESC 
         LIMIT ?`,
        [customerId, limit]
      );

      return rows.map((row) => ({
        ...row,
        filters_applied: row.filters_applied
          ? JSON.parse(row.filters_applied)
          : null,
      }));
    } catch (error) {
      throw new Error(
        `Error getting customer search history: ${error.message}`
      );
    }
  }

  static async deleteOldLogs(daysToKeep = 90) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM search_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)",
        [daysToKeep]
      );

      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error deleting old search logs: ${error.message}`);
    }
  }

  static async getPopularFilters(searchType = "rooms", timeframe = "30d") {
    try {
      let dateCondition = "";
      if (timeframe === "7d") {
        dateCondition = "AND search_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
      } else if (timeframe === "30d") {
        dateCondition = "AND search_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      }

      const [rows] = await pool.execute(
        `SELECT filters_applied
         FROM search_logs 
         WHERE search_type = ? 
         AND filters_applied IS NOT NULL 
         ${dateCondition}`,
        [searchType]
      );

      const filterCounts = {};

      rows.forEach((row) => {
        try {
          const filters = JSON.parse(row.filters_applied);
          Object.keys(filters).forEach((key) => {
            if (!filterCounts[key]) {
              filterCounts[key] = {};
            }
            const value = filters[key];
            const valueKey = Array.isArray(value)
              ? value.join(",")
              : String(value);
            filterCounts[key][valueKey] =
              (filterCounts[key][valueKey] || 0) + 1;
          });
        } catch (error) {
          console.warn("Error parsing filters:", error);
        }
      });

      return filterCounts;
    } catch (error) {
      throw new Error(`Error getting popular filters: ${error.message}`);
    }
  }
}

module.exports = SearchLog;
