
export const handleDownloadProposalAsWord = async (proposalId: string) => {
  try {
    // Here you would implement the actual Word document generation
    // For now, we'll just show a console message
    console.log(`Downloading proposal ${proposalId} as Word document`);
  } catch (error) {
    console.error('Error downloading proposal:', error);
  }
};

export const formatProposalId = (id: string) => {
  if (id.startsWith('КП-')) return id;
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const randomNum = Math.floor(10000 + Math.random() * 90000).toString();
  
  return `КП-${year}${month}-${randomNum}`;
};
