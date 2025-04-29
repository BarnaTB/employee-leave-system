
package ist.leaves.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    public OAuth2AuthenticationSuccessHandler(JwtTokenProvider jwtTokenProvider, ObjectMapper objectMapper) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        // Set response type to JSON
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        
        try {
            logger.debug("Authentication object: {}", authentication);
            
            if (authentication == null) {
                logger.error("Authentication is null");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                    "error", "Authentication failed", 
                    "message", "No authentication data found"
                )));
                return;
            }
            
            // Check if we're dealing with OAuth2AuthenticationToken
            if (authentication instanceof OAuth2AuthenticationToken) {
                OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                OAuth2User oauth2User = oauthToken.getPrincipal();
                
                logger.debug("OAuth2User details: {}", oauth2User);
                
                if (oauth2User == null) {
                    logger.error("OAuth2User principal is null");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                        "error", "Authentication failed", 
                        "message", "OAuth2User principal is null"
                    )));
                    return;
                }
                
                // Extract email from attributes for token generation
                String email = null;
                Map<String, Object> attributes = oauth2User.getAttributes();
                
                if (attributes.containsKey("email")) {
                    email = (String) attributes.get("email");
                } else if (attributes.containsKey("preferred_username")) {
                    email = (String) attributes.get("preferred_username");
                }
                
                if (email == null) {
                    logger.error("Could not extract email from OAuth2User attributes");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                        "error", "Authentication failed", 
                        "message", "Could not extract email from user profile"
                    )));
                    return;
                }
                
                // Generate token based on available data
                String token;
                if (oauth2User instanceof CustomOAuth2User) {
                    CustomOAuth2User customUser = (CustomOAuth2User) oauth2User;
                    token = jwtTokenProvider.generateToken(customUser);
                    logger.info("Generated token for CustomOAuth2User: {}", customUser.getEmail());
                } else {
                    token = jwtTokenProvider.generateToken(email);
                    logger.info("Generated token for email: {}", email);
                }
                
                Map<String, String> tokenResponse = new HashMap<>();
                tokenResponse.put("token", token);
                response.getWriter().write(objectMapper.writeValueAsString(tokenResponse));
            } else {
                logger.warn("Authentication is not an instance of OAuth2AuthenticationToken: {}", 
                    authentication.getClass().getName());
                
                String token = jwtTokenProvider.generateToken(authentication.getName());
                response.getWriter().write(objectMapper.writeValueAsString(Map.of("token", token)));
            }
        } catch (Exception ex) {
            logger.error("Error in authentication success handler", ex);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "error", "Authentication failed",
                "message", ex.getMessage()
            )));
        }
    }
}
