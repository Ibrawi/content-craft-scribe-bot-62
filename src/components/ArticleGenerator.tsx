
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { simulateApiCall } from "@/utils/contentGeneration";
import ResearchDataInput from "@/components/ArticleGeneratorComponents/ResearchDataInput";
import KeywordsInput from "@/components/ArticleGeneratorComponents/KeywordsInput";
import ArticleOptions from "@/components/ArticleGeneratorComponents/ArticleOptions";
import ToneAndLengthControls from "@/components/ArticleGeneratorComponents/ToneAndLengthControls";
import AdvancedOptionsPanel from "@/components/ArticleGeneratorComponents/AdvancedOptionsPanel";
import ResearchHandler from "@/components/ArticleGeneratorComponents/ResearchHandler";
import { performWebResearch } from "@/services/researchService";

interface ArticleGeneratorProps {
  onContentGenerated: (content: string, keywords?: string, title?: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  isGenerating: boolean;
}

const ArticleGenerator = ({ onContentGenerated, setIsGenerating, isGenerating }: ArticleGeneratorProps) => {
  const [researchData, setResearchData] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [articleLength, setArticleLength] = useState(3000);
  const [tone, setTone] = useState("informative");
  const [includeImages, setIncludeImages] = useState(true);
  const [includeFAQs, setIncludeFAQs] = useState(true);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [seoLevel, setSeoLevel] = useState(80);
  const [targetAudience, setTargetAudience] = useState("");
  const [contentSpecificity, setContentSpecificity] = useState(85);
  const [isResearching, setIsResearching] = useState(false);
  const { toast } = useToast();

  const generateContent = async () => {
    if (!targetKeywords.trim()) {
      toast({
        title: "Keywords Required",
        description: "Please enter at least one keyword to generate content.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      let finalResearchData = researchData;
      
      if (!researchData.trim() || researchData.trim().length < 100) {
        toast({
          title: "Performing Research",
          description: "No research data provided. Conducting comprehensive web research...",
        });
        
        const webResearchData = await performWebResearch(
          targetKeywords, 
          setIsResearching,
          (props) => toast(props)
        );
        finalResearchData = webResearchData;
      } else {
        toast({
          title: "Enhancing Research",
          description: "Supplementing your research with additional information...",
        });
        
        const supplementalData = await performWebResearch(
          targetKeywords,
          setIsResearching,
          (props) => toast(props)
        );
        finalResearchData = `${researchData}\n\nADDITIONAL RESEARCH:\n${supplementalData}`;
      }
      
      const content = await simulateApiCall({
        researchData: finalResearchData,
        targetKeywords,
        articleLength,
        tone,
        includeImages,
        includeFAQs,
        seoLevel,
        targetAudience,
        contentSpecificity,
        includeExamples: true,
        includeStatistics: true,
        useCaseStudies: true
      });
      
      // Extract title from content (first heading)
      const titleMatch = content.match(/^# (.+)/m);
      const generatedTitle = titleMatch ? titleMatch[1] : targetKeywords.split(',')[0]?.trim();
      
      onContentGenerated(content, targetKeywords, generatedTitle);
      
      toast({
        title: "Content Generation Complete",
        description: "Your high-quality, SEO-optimized article has been generated with enhanced research and analytics.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResearchComplete = (data: string) => {
    setResearchData(data);
  };

  return (
    <div className="space-y-6">
      <KeywordsInput 
        targetKeywords={targetKeywords} 
        setTargetKeywords={setTargetKeywords} 
      />

      <ResearchDataInput 
        researchData={researchData} 
        setResearchData={setResearchData} 
      />

      <ToneAndLengthControls
        tone={tone}
        setTone={setTone}
        articleLength={articleLength}
        setArticleLength={setArticleLength}
      />

      <ArticleOptions 
        advancedOptions={advancedOptions}
        setAdvancedOptions={setAdvancedOptions}
        includeImages={includeImages}
        setIncludeImages={setIncludeImages}
        includeFAQs={includeFAQs}
        setIncludeFAQs={setIncludeFAQs}
      />
      
      {advancedOptions && (
        <AdvancedOptionsPanel 
          seoLevel={seoLevel}
          setSeoLevel={setSeoLevel}
          targetAudience={targetAudience}
          setTargetAudience={setTargetAudience}
        />
      )}

      <ResearchHandler 
        targetKeywords={targetKeywords}
        isGenerating={isGenerating}
        handleGenerateContent={generateContent}
        onResearchComplete={handleResearchComplete}
      />
    </div>
  );
};

export default ArticleGenerator;
